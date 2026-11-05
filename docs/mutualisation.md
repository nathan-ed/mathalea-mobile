# Mutualisation des parcours entre enseignants

Demande de Nathan (5 novembre 2026, seconde tâche après la remédiation) :
« comment faire en sorte que les enseignants collaborent pour travailler sur
ces parcours ». Proposition, à discuter ; rien n'est construit ici.

## 1. Ce qui existe

| Moyen | Où | Ce qu'il permet | Ce qui manque |
| --- | --- | --- | --- |
| Dossier partagé suivi « Seulement les parcours » | app | reprendre les parcours d'un collègue | savoir d'où vient un parcours repris, être prévenu de sa nouvelle version |
| « Éditer un parcours existant », Dupliquer | app, site | adapter | le lien avec l'original se perd |
| Salons (`mathalea-salons`, `parcours.gemaths.net`) | site | éditer à plusieurs en direct (Yjs), présence et verrous, discussion, commentaires sur un exercice, une fiche, un palier | rien hors du salon : pas de bibliothèque commune ni de recherche ; comptes créés par l'administrateur |
| Liste d'objectifs (CSV, `objectifs-mathalea/1`) | app, site | étiqueter pareil | la remédiation et les objectifs par réponse ne voyagent pas avec la liste |
| Explorer (dossier kDrive de CoopMaths) | app | catalogue relu, joué de A à Z avant dépôt | une seule porte d'entrée : le dépôt `explorer/` et Nathan |
| Relevé d'une session, vue Objectifs | app | diagnostic d'une classe | rester sur un seul appareil |

La recherche citée dans `revue-pistes-2026-10.md` (5.2) donne la direction :
les enseignants **adaptent** plus qu'ils ne reprennent, partagent peu leurs
adaptations, et c'est la collaboration **sur l'évaluation** (ce que les
élèves réussissent ou non) qui est la plus liée aux progrès. Une banque de
dépôt ne suffit pas ; il faut des projets communs et des retours d'usage.

## 2. L'idée : mutualiser des pièces, pas seulement des parcours

Un parcours est trop lié à une classe pour être repris tel quel. Les pièces
qui le composent, elles, se réutilisent partout. La remédiation en ajoute deux
très réutilisables :

1. **L'exercice réglé et étiqueté** : un exercice MathALÉA, ses réglages,
   ses objectifs, ses objectifs par réponse (`points`). Étiqueter TSA3-32
   une fois (la dérivée, puis le tableau de variations) sert à tous ceux qui
   l'utilisent. L'app garde déjà ces étiquettes par exercice
   (`etiquettes`, `cleExercice`) : il suffit de les partager.
2. **L'objectif avec sa remédiation** : libellé, code du programme,
   exercices de remédiation, fiche, prérequis. C'est le graphe des
   prérequis, construit à plusieurs.
3. La **fiche de cours** (déjà un fichier à part, `fiche-mathalea/1`).
4. Le **parcours**, assemblage des pièces, avec sa filiation.

Une « banque d'équipe » rassemble ces pièces : liste d'objectifs (avec
remédiations), étiquettes d'exercices, fiches, parcours. Tout parcours de
l'équipe en profite : ses objectifs prennent les remédiations de la banque,
ses exercices les étiquettes par réponse, sans que chacun refasse le
travail.

## 3. Filiation et versions

- `origine: { id, version, auteurs }` posé quand on reprend un parcours (dossier
  d'un collègue, Explorer, salon). L'éditeur affiche « Repris de … (V3) » ;
  quand l'original passe en V4, « Une nouvelle version de l'original existe :
  voir ce qui change » (comparaison exercice par exercice, déjà possible avec
  `reprendreResultats`), reprendre tout ou une partie.
- Dans l'autre sens : « Proposer mes changements à l'auteur » envoie une
  suggestion (dans un salon, un commentaire avec la différence) ; l'auteur
  accepte ou non. Pas de fusion automatique de parcours : trop de cas.
- Licence affichée : CC BY-SA 4.0 pour parcours et fiches (comme MathALÉA),
  `auteurs` déjà dans le format.

## 4. Salons : en faire le lieu des projets communs

Les salons ont l'essentiel (édition à plusieurs, commentaires). Ajouts
proposés, par ordre d'utilité :

1. **Banque du salon** : objectifs (avec remédiations), étiquettes
   d'exercices, fiches, en plus des parcours ; un objectif ajouté ou une
   remédiation améliorée profite à tous les parcours du salon.
   `remediations` à ranger en liste à clés (`writeList`) et non en un champ
   d'en-tête, pour que deux personnes ne s'écrasent pas.
2. **Répartition du travail** : sur le plan d'un parcours ou d'une
   progression, « je prends la ceinture orange », « à relire par… »
   (commentaire attribué, résolu quand c'est fait).
3. **Relecture avant publication** : un parcours du salon passe par
   « Prêt à relire », un collègue le joue (aperçu élève, déjà là) et le
   marque « Relu ». Seuls les parcours relus partent dans le fichier publié
   de l'équipe. Vérifications automatiques au même moment (section 6).
4. **Invitations par lien** sans passer par l'administrateur pour un salon
   d'équipe (l'administrateur garde les salons ouverts à plusieurs
   établissements).

## 5. Retours d'usage, sans données d'élève

Ce qui fait progresser un parcours, ce sont ses résultats. Le relevé d'une
session (déjà calculé sur l'appareil de l'enseignant) peut produire un
**résumé de classe** : pour chaque question et chaque objectif, le taux de
réussite et le nombre d'élèves, rien d'autre (ni prénom, ni réponse, ni
appareil). Avec un seuil (pas de résumé sous 5 élèves), ce n'est plus une
donnée personnelle.

- L'enseignant choisit de déposer ce résumé dans le salon ou le dossier
  d'équipe (geste volontaire, comme l'export).
- La banque montre, pour un parcours : « fait par 6 classes ; la question 3
  de la ceinture jaune est réussie à 35 % » ; pour un objectif : les
  remédiations qui ont mené à une reprise réussie le plus souvent (si l'élève
  accepte de les inclure dans ce qu'il montre, comme le QR code).
- C'est la base d'une heure de concertation (étude collective de leçon) :
  les questions qui posent problème partout, et pourquoi.

À ne pas faire : un tableau de bord riche ; un classement des enseignants
ou des classes ; toute remontée automatique.

## 6. Qualité : les vérifications de l'Explorer pour tous

Le dépôt fait déjà, avant chaque dépôt sur le drive de l'Explorer :
chaque exercice préparé sous trois graines (`catalogue-moteur`), chaque
parcours joué de A à Z par un élève qui répond juste (`parcours-az`), champs
visibles. Les mêmes contrôles, en plus courts, dans l'éditeur du site au
moment de « Prêt à relire » : exercice non interactif, champ coupé,
objectifs par réponse instables (sonde des points), ceinture vide,
remédiation sans exercice. Un parcours d'équipe relu et vérifié peut être
proposé à l'Explorer : Nathan (ou l'équipe de l'Explorer) le reprend dans le
dépôt, avec sa filiation.

## 7. Par où commencer

| Étape | Contenu | Où |
| --- | --- | --- |
| 1 | `origine` et « Repris de … », alerte de nouvelle version | format, app, site |
| 2 | Objectifs par réponse et remédiations dans la liste d'objectifs partagée (`objectifs-mathalea/1`) ; étiquettes d'exercices exportées avec elle | format, app, site |
| 3 | Banque du salon (objectifs, étiquettes, fiches) ; `remediations` en liste à clés | site, serveur des salons |
| 4 | Résumé de classe anonyme, déposé à la main ; vue « Retours » d'un parcours | app (relevé), site |
| 5 | Relecture avant publication, vérifications automatiques dans l'éditeur | site |
| 6 | Proposer à l'Explorer | dépôt, site |

L'étape 2 est la plus rentable tout de suite : elle fait voyager le travail
de remédiation (le plus long à faire) avec la liste d'objectifs que les
équipes s'échangent déjà.

## 8. Questions pour Nathan

1. Le serveur des salons (`parcours.gemaths.net`) peut-il garder une banque
   (objectifs, étiquettes, résumés de classe) ou faut-il rester sur des
   fichiers dans les drives ?
2. Les résumés de classe anonymes : acceptables, avec quel seuil d'élèves ?
3. Qui relit pour l'Explorer : toi seul, ou une équipe par pays ?
4. Licence : CC BY-SA 4.0 pour tous les parcours partagés ?
