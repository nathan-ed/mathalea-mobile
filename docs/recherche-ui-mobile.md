# Interface mobile : ce que disent les références (novembre 2026)

Recherche faite le 26 novembre 2026, après le retour de Rémi sur l'accueil
(« titre sur plusieurs lignes, beaucoup de place perdue, il faudrait moins
d'espaces vides sur petit écran »). Le but : fonder la refonte de l'interface
sur des règles établies, pas sur des goûts. Chaque point renvoie à sa source ;
les chiffres non vérifiés sont signalés.

## 1. Densité et place à l'écran

- Sur un téléphone, perdre de la place est une faute sérieuse ; une densité
  plus forte réduit les gestes et fait voir ce qu'on cherche. Limite : ne pas
  tout entasser.
  ([NN/g, utiliser l'espace disponible](https://www.nngroup.com/articles/utilize-available-screen-space/),
  [NN/g, dispersion du contenu](https://www.nngroup.com/articles/content-dispersion/))
- Le défilement n'est pas gratuit : on ne fait défiler que si ce qui suit
  promet quelque chose. Les marges décoratives allongent sans rien apporter.
  ([NN/g, état de l'UX mobile](https://www.nngroup.com/articles/state-mobile-ux/))
- Les sections repliables raccourcissent la page mais cachent : à réserver au
  contenu secondaire.
  ([NN/g, densité d'information](https://www.nngroup.com/topic/information-density/))

Pour l'app : un élément de liste tient en deux lignes au plus (titre, état) ;
le titre a toute la largeur ; aucun bloc sans information (champ de recherche
vide en tête d'un accueil de trois parcours, intertitre qui répète l'onglet).

## 2. Anatomie d'un élément de liste

- Material 3 : titre (headline), texte d'appui (supporting text), élément de
  tête (leading) et de fin (trailing). Hauteur 56 dp sur une ligne, 72 dp avec
  texte d'appui ; les éléments de tête et de fin s'alignent sur le titre.
  ([Compose ListItem](https://developer.android.com/reference/kotlin/androidx/compose/material3/ListItem.composable),
  [m3.material.io, Lists](https://m3.material.io/components/lists/overview))
- Apple : les listes portent la hiérarchie de l'app et la navigation ; les
  actions de ligne passent par le balayage ou le menu contextuel, accessibles
  à VoiceOver.
  ([HIG, Lists and tables](https://developer.apple.com/design/human-interface-guidelines/lists-and-tables))
- Plusieurs icônes éparpillées sur une carte troublent ; une carte a une
  action principale (l'ouvrir), les autres commandes restent séparément
  touchables.
  ([Stan Vision, cartes](https://www.stan.vision/journal/ui-card-design-examples-best-practices-and-common-patterns),
  [Ramotion, cartes](https://www.ramotion.com/blog/card-ui-design/))

Pour l'app : tuile = ouvrir ; épingle et œil groupés dans une seule colonne de
fin ; icône, pastille et état sur la ligne d'appui sous le titre.

## 3. Actions visibles ou cachées

- Ce qui est caché est moins utilisé et plus lent à trouver ; les icônes
  « ⋯ » sont comprises mais souvent manquées si elles sont discrètes. Les
  garder pour le secondaire.
  ([NN/g, menus cachés](https://www.nngroup.com/articles/hamburger-menus/),
  [NN/g, menus contextuels](https://www.nngroup.com/articles/contextual-menus-guidelines/),
  [Daniel Burka, abus des menus « ⋯ »](https://www.freecodecamp.org/news/stop-the-overuse-of-overflow-menus-5caa4b54e843/))

Pour l'app : une action principale visible par écran (déjà la règle), le
reste dans « Autres actions » ; épingler et cacher restent visibles car ils
servent souvent.

## 4. Cibles tactiles et prise en main

- 44 pt (Apple), 48 dp (Android), au moins 24 px CSS (WCAG 2.2 AA) et 44 px
  pour le niveau AAA.
  ([W3C, Target Size Enhanced](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced),
  [Google, touch target](https://support.google.com/accessibility/android/answer/7101858))
- Trois tenues du téléphone ; le pouce atteint sans effort le bas de l'écran ;
  le centre est regardé et touché le plus. Hoober nuance : pas une règle fixe.
  ([UXmatters, Hoober](https://www.uxmatters.com/mt/archives/2013/02/how-do-users-really-hold-mobile-devices.php),
  [Smashing, thumb zone](https://smashingmagazine.com/2016/09/the-thumb-zone-designing-for-mobile-users),
  [Addy Osmani, touch-friendly](https://addyosmani.com/blog/touch-friendly-design/))

Pour l'app : boutons de 44 px au moins, action principale en bas (barre du
bas, déjà le cas en séance), rien d'important dans les coins du haut.

## 5. Panneaux du bas

- Bons pour des tâches courtes et secondaires (choix, filtres, actions),
  fermables par le geste retour ; pas pour une confirmation critique ni un
  parcours en plusieurs étapes ; jamais en plein écran.
  ([NN/g, bottom sheets](https://www.nngroup.com/articles/bottom-sheet/),
  [Material, bottom sheets](https://m1.material.io/components/bottom-sheets.html))

Pour l'app : `Feuille` suit déjà ces règles (retour du téléphone, hauteur
limitée).

## 6. Texte

- Corps de 16 px, interligne 1,4 à 1,6, 40 à 60 caractères par ligne sur
  téléphone, titres au moins 1,3 fois le corps ; respecter le texte agrandi
  par l'utilisateur.
  ([Smashing, typographie mobile](https://www.smashingmagazine.com/2018/06/reference-guide-typography-mobile-web-design/),
  [Toptal, typographie mobile](https://www.toptal.com/designers/typography/typography-for-mobile-apps))

Pour l'app : titres de tuile 16 px gras, état 14 px ; pas de texte gris clair
sous 14 px.

## 7. Mouvement

- Retour d'un geste simple : environ 100 ms ; changement d'écran ou panneau :
  200 à 300 ms ; les animations sont bien plus souvent trop longues que trop
  courtes ; respecter « réduire les animations ».
  ([NN/g, durée des animations](https://nngroup.com/articles/animation-duration),
  [Material, durée et accélération](https://m1.material.io/motion/duration-easing.html),
  [GitLab, animations de retour](https://design.gitlab.com/product-foundations/animation-feedback))
- Things 3 : chaque animation a un but ; la sobriété vient de ce qu'on refuse.
  ([MacStories, Things 3](https://www.macstories.net/reviews/things-3-beauty-and-delight-in-a-task-manager/),
  [Blake Crosley, étude de Things](https://blakecrosley.com/blog/design-study-things))

## 8. Apps d'apprentissage : progression et motivation

- Duolingo (2022) a remplacé l'arbre de compétences par un chemin guidé :
  les élèves ne savaient pas « par où commencer ». Critique : moins de choix.
  ([Blog Duolingo](https://blog.duolingo.com/new-duolingo-home-screen-design),
  [NBC, entretien Luis von Ahn](https://www.nbcnews.com/tech/tech-news/duolingos-update-redesign-luis-von-ahn-interview-rcna44655))
- Khan Academy Kids : un bouton « jouer » sur l'accueil lance le chemin ; la
  progression est rangée ailleurs (bibliothèque).
  ([Khan Kids, aide](https://khankids.zendesk.com/hc/en-us/articles/360041615571))
- Voir sa progression sert le besoin de compétence (théorie de
  l'autodétermination) quand elle reflète une vraie maîtrise ; séries de
  jours et badges risquent de miner la motivation intrinsèque, surtout chez
  les jeunes.
  ([BMC Psychology 2026](https://link.springer.com/article/10.1186/s40359-026-05046-8),
  [MDPI, nudges EdTech](https://www.mdpi.com/2254-9625/15/9/179),
  [revue SDT, arXiv](https://arxiv.org/pdf/2402.00121))
- Brilliant : tuiles de leçon et suivi de progression dessinés avec soin, un
  peu de « game feel » dans l'animation, pas de surcharge.
  ([ustwo × Brilliant](https://ustwo.com/work/brilliant/),
  [Rive × Brilliant](https://rive.app/blog/how-brilliant-org-motivates-learners-with-rive-animations))

Pour l'app (déjà décidé par Nathan, confirmé par la recherche) : une seule
action proposée en haut de l'accueil ; ceintures et barrettes comme marques
de maîtrise réelle ; ni points, ni séries de jours, ni classements. À ajouter :
voir d'un coup d'œil où l'on en est dans chaque parcours (ceintures obtenues
en couleur sur la tuile) plutôt qu'une phrase.

## 9. Tendances des plateformes (2025-2026)

- Material 3 Expressive : 46 études, 18 000 participants (chiffres de
  Google) ; taille, couleur, forme et contenant pour hiérarchiser ; contrôles
  clés trouvés jusqu'à 4 fois plus vite.
  ([Google Design](https://design.google/library/expressive-material-design-google-research),
  [Dezeen](https://www.dezeen.com/2025/05/28/google-ushers-in-age-of-expressive-interfaces-with-material-design-update/))
- iOS 26, Liquid Glass : barre d'onglets flottante qui se réduit au
  défilement, contenu en avant.
  ([Apple Newsroom](https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/),
  [HIG, Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars))
- Apple Design Awards 2025 : aucune catégorie « éducation » ; CapWords
  (apprentissage des langues) primée en « Delight and Fun ».
  ([Apple Developer](https://developer.apple.com/design/awards/2025/))

Pour l'app : on reprend les principes (hiérarchie par la taille et le
contenant, contenu d'abord), pas les effets (verre, formes décoratives), qui
sortiraient de la charte MathALÉA.

## 10. Principes retenus pour MathALÉA mobile

1. **Le contenu d'abord** : rien au-dessus de la première tuile qui ne serve
   pas tout de suite ; recherche seulement quand la liste est longue.
2. **Deux lignes par élément** : titre en pleine largeur, ligne d'état
   dessous ; actions de fin dans une seule colonne.
3. **La progression se voit** : ceintures en couleur sur la tuile et sur la
   page du parcours, au lieu de phrases.
4. **Une action principale par écran**, en bas ou en tête, jamais deux
   boutons pleins.
5. **Espacement sur une grille de 4 px** : 8 entre éléments liés, 16 entre
   blocs, 24 entre sections ; marges de 16 px sur le côté.
6. **Tout tient à 360 px** (petit Android) sans titre coupé en cinq lignes.
7. **Mouvement court** : 100 ms pour un retour, 200 à 250 ms pour un écran ou
   un panneau, rien quand l'élève demande moins d'animations.
8. **Charte MathALÉA** inchangée : couleurs, polices, icônes boxicons ; aucun
   dégradé, aucune décoration.
