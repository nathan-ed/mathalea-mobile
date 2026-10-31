# Vérification de la 0.4.10 et revue du code (30 octobre 2026)

Session cloud sur `release-0.4.11`, sans accès à la forge de MathALÉA.

## Release : pas de tag

Le moteur de la 0.4.10 (MathALÉA `142fed3` et `moteur/fichiers` actuels) n'a
pas pu être construit : forge.apps.education.fr, mathalea.fr et le stockage
des artefacts GitHub sont bloqués par le réseau de la session. La
vérification a tourné avec le moteur extrait de l'app 0.4.9
(`scripts/moteur-depuis-app.py`, 5378 fichiers conformes à `manifest.json`) :
MathALÉA `8757328`, sans les corrections f52eb96 et 9208843.

`verifier-release.sh` sur 876a82a : 22 suites vertes, 5 en échec (formats,
az-1, az-2, az-3, reponses-elements). Chaque échec correspond à une
correction absente du moteur 0.4.9 :

| Échec | Parcours ou suite | Correction manquante |
|---|---|---|
| Nombre sans espaces compté faux (7efdf) | prq-nombres-ecritures-reperage, reponses-elements | `sansEspacesExiges` |
| Figures à cliquer (9ES2B-1, CM2G5C-1) | evacom-11ls, evacom-taf, formats | `activerCliqueFigures` |
| Figures apigeom (9QCM-22, 9ES1E-20) | evacom-taf, prq-nombres, formats | `ajusterApigeom` |
| Questions 2 et 3 enregistrées vides (9ES1B-7, 9GM1B-13, 9FA2B-18, 9GM1B-5, tableauMathlive, « plusieurs ») | prq-figures, prq-donnees, prq-perimetres, evacom-taf | `indicesDeLaQuestion`, `videAccepte` |

Aucun échec ne vient de l'app, mais le moteur livré n'a pas été vérifié et
des parcours Préqualifiant échouent : pas de tag. À faire sur l'ordinateur de
Nathan : `bash scripts/publier.sh v0.4.10`, puis Google Play en piste
interne (`enable`, `run -f piste=internal`, `disable`). Depuis la session,
`gh` n'a pas de jeton valide et l'accès GitHub ne peut pas lancer de
workflow.

## « 0/0 correctes » du test glisser-déposer

Cinq passages de `FORMAT=dnd node e2e/formats.mjs` : 2/2 à chaque fois.
Cause reproduite : une page rechargée pendant la relecture finale de la
séance donnait « ✔ dnd (85618) : 0/0 correctes » puis « TOUT VERT ». La
lecture ratée était avalée (`.catch(() => null)`), zéro vérification
n'était un échec que pour les formats « prise-en-compte », et les erreurs
JavaScript n'étaient pas signalées en mode formats. Corrigé dans 876a82a :
séance relue jusqu'à trois fois, sinon « séance illisible » ; « aucune
vérification enregistrée » pour tout format ; erreurs JavaScript rattachées
au format. Même rechargement simulé : 2/2.

## Moteur de chaque version

Règle ajoutée (AGENTS.md, `docs/developpement.md`, skill) : commiter le
moteur de chaque version dans `releases/<v>/MathALEA-<x>-moteur.tar.gz`.
L'archive de la 0.4.9 n'est pas commitée : GitHub refuse l'envoi Git LFS
depuis la session. La refaire avec :

```sh
dpkg -x releases/v0.4.9/MathALEA-0.4.9-linux-amd64.deb /tmp/app
python3 -I scripts/moteur-depuis-app.py /tmp/app/usr/bin/mathalea-mobile /tmp/m
tar -czf releases/v0.4.9/MathALEA-0.4.9-moteur.tar.gz -C /tmp/m moteur
```

## Revue du code

Bon état général : `pnpm check` sans erreur, aucun `any` ni `@ts-ignore`,
aucun TODO, intervalles et écouteurs nettoyés, texte des fiches échappé
avant `{@html}` (`texteRiche`, `titreHtml`), images de fiche limitées aux
`data:image`, restauration de sauvegarde annulée en cas d'échec. Rien n'a
été modifié dans `src/`. À reprendre, du plus utile au moins utile :

1. `partage.ts`, `jsonDuZip` : `unzipSync` décompresse tout le dossier
   (PDF, vidéos déposés à côté). Risque de mémoire sur un petit téléphone.
   Filtrer les `.json` avec une taille maximale (`unzipSync(c, { filter })`).
2. `telechargement.rs` : ni délai ni taille maximale. Un drive qui ne
   répond pas bloque l'actualisation ; un gros fichier part en mémoire.
   Proposition : 30 s et environ 20 Mo.
3. `capabilities/default.json` : `http://*:8702/*` (reste des essais, HTTP
   vers tout hôte) ; `https://*/*` rend inutiles les adresses des drives ;
   pas de CSP (`csp: null`).
4. `Seance.svelte:321` : hauteur du clavier recalculée toutes les 120 ms
   pendant toute la séance (batterie). `ResizeObserver` ou `visualViewport`.
5. `validation.ts` : `nbQuestions` sans plafond ; un fichier partagé avec un
   très grand nombre fige le téléphone. Proposition : 100 au plus.
6. Mineurs : caméra acceptée d'office sous Linux (`lib.rs`) ; réponse
   kDrive sans `data` qui donne une erreur peu claire ; message en anglais
   dans `lib.rs` ; `tsx` retéléchargé par `npx` à chaque vérification (pas
   dans les dépendances de développement).
7. Fichiers à découper : `+page.svelte` (1393 lignes),
   `CreationParcours.svelte` (944), `EspaceEnseignant.svelte` (899).
