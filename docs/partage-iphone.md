# Feuille de partage de l'iPhone coupée (0.8.0)

État au 26 novembre 2026 au soir. Pas encore corrigé : la 0.8.1 (numérotée
sur la branche) attend la correction.

## Le défaut

Sur iPhone, « Imprimer », puis « Créer le PDF » (et tout fichier exporté)
ouvre la feuille de partage d'iOS dans un petit cadre en bas à droite de
l'écran : le contenu est agrandi et coupé (« AirDrop », « Copy » à moitié
visibles). Photo de Nathan, iPhone, 0.8.0 :
`partage-iphone/iphone-nathan-0.8.0.jpg`.

La « correction » de la 0.6.1 (imposer une feuille du bas sur iPhone)
n'avait été vérifiée que sur iPad : elle n'a jamais marché sur iPhone.

## Ce que montre le simulateur iPhone (workflow `emulateurs`, 26 novembre)

Le simulateur reproduit le défaut tel quel (iPhone, iOS 18.7, 402 × 874
points). `e2e/appareil-ios.mjs` ouvre la feuille après « Créer le PDF »,
puis six manières de la présenter (paramètre `variante` du plugin, essais
seulement), et lit le journal de l'app (`Partage[…]`).

| Variante | Réglage | Résultat |
|---|---|---|
| centre | bulle ancrée au centre, sans flèche | coupée en bas à droite |
| bas | bulle ancrée en bas au milieu | coupée en bas à droite |
| transition | bulle au centre + `preferredTransition = .coverVertical` | coupée en bas à droite |
| feuille | `.pageSheet`, hauteurs moyenne et grande | coupée en bas à droite |
| plein | `.overFullScreen` | coupée en bas à droite |
| sans-animation | bulle au centre, `animated: false` | coupée en bas à droite |

Captures : `partage-iphone/six-variantes-simulateur.jpg` (la première est le
PDF par l'interface, les six suivantes les variantes).

Journal d'iOS, identique pour les six :

```
Partage[centre] présentée : style 7, présentation _UIActivityViewControllerPresentationController,
cadre {{0, 0}, {148, 402}} dans {{0, 0}, {402, 874}}, fenêtre true
```

- iOS ignore nos réglages : même présentation (`_UIActivityViewControllerPresentationController`,
  style 7) et même cadre quoi qu'on demande, avec ou sans animation.
- La feuille reçoit un cadre de 148 × 402 points au lieu de la largeur de
  l'écran ; 402 est la largeur de l'écran : comme si iOS calculait la feuille
  pour un écran couché ou un conteneur faussé.
- Le bouton « Copy » est à x = −29 dans les coordonnées de l'écran : la
  feuille est décalée hors de l'écran, pas seulement mal placée.
- Ce n'est donc pas propre à iOS 26 (le simulateur est en iOS 18.7) ni à
  notre manière de présenter : la cause est dans la fenêtre ou le contrôleur
  qui présente.

## Piste pour le 27 novembre

Suspect principal : la fenêtre et le contrôleur racine créés par Tao (la
bibliothèque de fenêtres de Tauri, `tao 0.37.1`, `platform_impl/ios/view.rs`).
Sa vue racine remet son cadre aux dimensions de la fenêtre à chaque
`layoutSubviews`, y compris pendant les transitions de contrôleurs, et son
contrôleur redéfinit l'orientation et la barre d'état. Une feuille présentée
depuis ce contrôleur hérite d'une géométrie faussée.

Essais à faire, dans cet ordre, en un passage du simulateur :

1. Présenter la feuille depuis une fenêtre à part (`UIWindow` sur la même
   scène, contrôleur `UIViewController` neuf, `windowLevel` au-dessus), puis
   la fermer à la fin du partage (`completionWithItemsHandler`). C'est
   indépendant de Tao.
2. Journaliser la classe du contrôleur qui présente, sa `traitCollection`
   (classes de taille), l'orientation de la scène et le cadre de la fenêtre,
   pour confirmer la cause.
3. En dernier recours : `UIDocumentInteractionController` (aperçu Quick Look
   avec son propre bouton de partage).

Critère vérifié par la suite : « Copy » visible en entier, dans la moitié
gauche de l'écran (x ≥ 0). Corrigé le 26 au soir : la suite comptait x = −29
comme « dans l'écran ».

Une fois la bonne manière trouvée : la garder seule dans le plugin (retirer
`variante` et le journal), relancer `emulateurs`, regarder la capture, puis
proposer la 0.8.1 (TestFlight, sans Google Play).
