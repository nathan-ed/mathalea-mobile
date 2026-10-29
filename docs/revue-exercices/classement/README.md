# Classement des constats par type d'action

Tous les constats de la revue (banc, contrôles de texte, code, relecture),
classés selon qui doit agir et comment. Chaque constat a une clé stable
(`A-…` regroupement automatique, `L-…` constat de relecture) et une seule
catégorie. Fichier produit par `node revue/classer.mjs`, contrôlé par
`node revue/verifier-classement.mjs`.

| Catégorie | Qui, comment | Constats | Exercices | Occurrences |
| --- | --- | ---: | ---: | ---: |
| [Interactif faux](tickets-interactif.md) | Développeur (ticket). Chaque constat donne la graine, les paramètres et la saisie qui reproduisent le défaut. | 203 | 158 | 2848 |
| [Rendu cassé, exception, question vide ou en double](tickets-rendu.md) | Développeur (ticket). | 904 | 318 | 11370 |
| [Contenu mathématique et formulation](maths-formulation.md) | Avis d'un enseignant-développeur : erreur ou ambiguïté mathématique, titre sans rapport avec l'exercice, explication à reprendre. | 267 | 251 | 400 |
| [Décisions à prendre](decisions.md) | Développeur MathALÉA : harmonisations (tutoiement, notation, orthographe), paramètres sans effet ou absurdes, doublons, figures trop larges. | 2567 | 1131 | 25329 |
| [Mise en évidence à aligner sur le champ](mise-en-evidence.md) | Correction à la chaîne : ce qui est mis en évidence doit être exactement ce que le champ attend, sans texte ni unité. | 7426 | 1357 | 57722 |
| [Français : fautes, coquilles, accords, tournures](francais.md) | Correction à la chaîne. | 1617 | 1050 | 9065 |
| [Typographie et écriture des nombres](typographie.md) | Correction à la chaîne (espaces, $, séparateurs, points de suspension, point final). | 6625 | 2388 | 194894 |
| [Défauts de l'app MathALÉA mobile](app-mobile.md) | Nathan (moteur de l’app, pas les exercices). | 16 | 13 | 108 |
| [Exercices de test, modèles ou inutilisables](a-ecarter.md) | Mis de côté : à retirer du référentiel ou à terminer, rien à corriger dans le détail. | 129 | 26 | 8084 |
| [Interactif à tester à la main](a-tester-main.md) | Pas une erreur : format que le banc ne sait pas remplir (glisser-déposer, figure, clic). | 307 | 290 | 22268 |
| [Pour mémoire](pour-memoire.md) | Information sur la couverture du banc, aucune action. | 251 | 251 | 260 |
| [Faux positifs écartés](faux-positifs.md) | Constats automatiques reconnus faux à la relecture, gardés pour la traçabilité. | 36 | 10 | 440 |
| **Total** | | **20348** | | **332788** |

## Correspondance avec les sources

- Relecture (`revue/relecture.jsonl`) : 2116 lignes, une clé `L-…` chacune.
- Code (`revue/source.jsonl`) : 1121 lignes.
- Contrôles de texte rejoués (`revue/texte.jsonl`) : 207602 lignes.
- Banc (`revue/journal.jsonl`) : 681130 lignes, dont 558894 de texte
  remplacées par les contrôles rejoués (même sortie, contrôles plus récents),
  10394 de texte gardées telles quelles (endroit que le contrôle rejoué ne
  couvre pas, par exemple les variantes non interactives) et
  287 « bonne réponse refusée » sans saisie (question absente,
  relevée en X4).
- Les constats automatiques sont regroupés comme dans `trouvailles.md` (même
  exercice, même règle, même endroit, même extrait aux nombres près) ;
  « Occurrences » compte les lignes sources.
- Archive complète, avec toutes les occurrences (variante, graine, question,
  saisie) : `revue/classement/constats.jsonl.gz`.
