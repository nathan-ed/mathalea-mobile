# Archives de la revue (29 octobre 2026)

Données du banc, hors Git ailleurs (trop grosses), compressées ici pour ne pas
les perdre.

| Fichier | Contenu | Taille décompressée |
| --- | --- | --- |
| `journal.jsonl.xz` | `revue/journal.jsonl` : une ligne par constat du banc (687 704 lignes) | 189 Mo |
| `texte.jsonl.xz` | `revue/texte.jsonl` : contrôles de texte rejoués sur les sorties | 63 Mo |
| `sorties.tar.xz` | `revue/sorties/` (énoncés, corrections et attendus de chaque variante), `fait.txt`, `fait-extra.txt` | 1 Go |

Restaurer, depuis `revue/` :

```bash
xz -dk archives/journal.jsonl.xz && mv archives/journal.jsonl .
```

```bash
xz -dk archives/texte.jsonl.xz && mv archives/texte.jsonl .
```

```bash
tar -xJf archives/sorties.tar.xz
```

Les captures (`revue/captures/`, 5,6 Go) ne sont pas archivées : le banc les
refait (`node revue/banc.mjs`, voir le skill `revue-exercices`).
