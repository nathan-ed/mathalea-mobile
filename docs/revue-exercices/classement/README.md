# Classement des constats par type d'action

Tous les constats de la revue (banc, contrôles de texte, code, relecture),
classés selon qui doit agir et comment. Chaque constat a une clé stable
(`A-…` regroupement automatique, `L-…` constat de relecture) et une seule
catégorie. Fichier produit par `node revue/classer.mjs`, contrôlé par
`node revue/verifier-classement.mjs`.

| Catégorie | Qui, comment | Constats | Exercices | Occurrences |
| --- | --- | ---: | ---: | ---: |
| [Interactif faux](tickets-interactif.md) | Développeur (ticket). Chaque constat donne la graine, les paramètres et la saisie qui reproduisent le défaut. | 107 | 79 | 1326 |
| [Rendu cassé, exception, question vide ou en double](tickets-rendu.md) | Développeur (ticket). | 677 | 307 | 9731 |
| [Contenu mathématique et formulation](maths-formulation.md) | Avis d'un enseignant-développeur : erreur ou ambiguïté mathématique, titre sans rapport avec l'exercice, explication à reprendre. | 266 | 250 | 399 |
| [Décisions à prendre](decisions.md) | Développeur MathALÉA : harmonisations (tutoiement, notation, orthographe), paramètres sans effet ou absurdes, doublons, figures trop larges. | 2578 | 1141 | 25617 |
| [Mise en évidence à aligner sur le champ](mise-en-evidence.md) | Correction à la chaîne : ce qui est mis en évidence doit être exactement ce que le champ attend, sans texte ni unité. | 7410 | 1351 | 57567 |
| [Français : fautes, coquilles, accords, tournures](francais.md) | Correction à la chaîne. | 1616 | 1050 | 9359 |
| [Typographie et écriture des nombres](typographie.md) | Correction à la chaîne (espaces, $, séparateurs, points de suspension, point final). | 6538 | 2386 | 195149 |
| [Défauts de l'app MathALÉA mobile](app-mobile.md) | Nathan (moteur de l’app, pas les exercices). | 28 | 19 | 557 |
| [Exercices de test, modèles ou inutilisables](a-ecarter.md) | Mis de côté : à retirer du référentiel ou à terminer, rien à corriger dans le détail. | 129 | 26 | 8084 |
| [Interactif à tester à la main](a-tester-main.md) | Pas une erreur : format que le banc ne sait pas remplir (glisser-déposer, figure, clic). | 321 | 302 | 22443 |
| [Pour mémoire](pour-memoire.md) | Information sur la couverture du banc, aucune action. | 251 | 251 | 260 |
| [Faux positifs écartés](faux-positifs.md) | Constats automatiques reconnus faux à la relecture, gardés pour la traçabilité. | 342 | 102 | 17197 |
| **Total** | | **20263** | | **347689** |

## Correspondance avec les sources

- Relecture (`revue/relecture.jsonl`) : 2117 lignes, une clé `L-…` chacune.
- Code (`revue/source.jsonl`) : 1121 lignes.
- Contrôles de texte rejoués (`revue/texte.jsonl`) : 224108 lignes.
- Banc (`revue/journal.jsonl`) : 687704 lignes, dont 567074 de texte
  remplacées par les contrôles rejoués (même sortie, contrôles plus récents),
  10304 de texte gardées telles quelles (endroit que le contrôle rejoué ne
  couvre pas, par exemple les variantes non interactives) et
  287 « bonne réponse refusée » sans saisie (question absente,
  relevée en X4).
- Les constats automatiques sont regroupés comme dans `trouvailles.md` (même
  exercice, même règle, même endroit, même extrait aux nombres près) ;
  « Occurrences » compte les lignes sources.
- Archive complète, avec toutes les occurrences (variante, graine, question,
  saisie) : `revue/classement/constats.jsonl.gz`.
