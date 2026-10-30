#!/usr/bin/env python3
"""Extrait le moteur embarqué dans le binaire Linux d'une release.

Tauri range l'interface (dont static/moteur) dans le binaire, compressée en
brotli. Sert à retrouver le moteur d'une version publiée sans accès à la forge
de MathALÉA. Contrôle : chaque fichier est comparé aux sommes SHA-256 de
manifest.json.

  dpkg -x releases/v0.4.9/MathALEA-0.4.9-linux-amd64.deb /tmp/app
  python3 -I scripts/moteur-depuis-app.py /tmp/app/usr/bin/mathalea-mobile <sortie>
  (moteur dans <sortie>/moteur ; besoin de pyelftools et brotli)
"""
import hashlib, json, os, struct, sys

import brotli
from elftools.elf.elffile import ELFFile
from elftools.elf.relocation import RelocationSection

binaire, sortie = sys.argv[1:3]
donnees = open(binaire, 'rb').read()
elf = ELFFile(open(binaire, 'rb'))
segments = [(s['p_vaddr'], s['p_offset'], s['p_filesz']) for s in elf.iter_segments() if s['p_type'] == 'PT_LOAD']


def position(adresse):
    for va, of, sz in segments:
        if va <= adresse < va + sz:
            return of + adresse - va
    return None


# Binaire PIE : les pointeurs de la table des fichiers sont des relocalisations relatives
pointeurs = {}
for section in elf.iter_sections():
    if isinstance(section, RelocationSection):
        for r in section.iter_relocations():
            if r['r_info_type'] == 8:  # R_X86_64_RELATIVE
                pointeurs[r['r_offset']] = r['r_addend']

# Entrée de la table : (&str chemin, &[u8] contenu), soit pointeur, longueur, pointeur, longueur
prefixe = b'/moteur/'
n = 0
for adresse, cible in pointeurs.items():
    debut = position(cible)
    entree = position(adresse)
    if debut is None or entree is None or donnees[debut:debut + len(prefixe)] != prefixe:
        continue
    longueur = struct.unpack_from('<Q', donnees, entree + 8)[0]
    contenu = pointeurs.get(adresse + 16)
    if longueur > 300 or contenu is None:
        continue
    taille = struct.unpack_from('<Q', donnees, position(adresse + 16) + 8)[0]
    brut = donnees[position(contenu):position(contenu) + taille]
    try:
        brut = brotli.decompress(brut)
    except brotli.error:
        pass
    chemin = os.path.join(sortie, donnees[debut:debut + longueur].decode().lstrip('/'))
    os.makedirs(os.path.dirname(chemin), exist_ok=True)
    open(chemin, 'wb').write(brut)
    n += 1

moteur = os.path.join(sortie, 'moteur')
manifeste = json.load(open(os.path.join(moteur, 'manifest.json')))
ecarts = [f for f, v in manifeste['fichiers'].items()
          if not os.path.isfile(os.path.join(moteur, f))
          or hashlib.sha256(open(os.path.join(moteur, f), 'rb').read()).hexdigest() != v['sha256']]
print(f"{n} fichiers, moteur {manifeste['version']}, {len(ecarts)} écart(s) avec manifest.json")
sys.exit(1 if ecarts else 0)
