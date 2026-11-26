# Feuille de partage de l'iPhone coupée (0.8.0)

État au 27 novembre 2026, nuit. **Corrigé dans la 0.8.1** : la feuille part
d'une fenêtre à part (voir « Correction » en bas).

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

## Deuxième série d'essais (26 novembre, 23 h) : la cause

Journal détaillé de chaque niveau de vues (classes de taille, orientation,
cadres, transformations) :

- La fenêtre de l'app (`TaoUIWindow`, créée par Tao, la bibliothèque de
  fenêtres de Tauri) et son contrôleur (`TaoUIViewController`) ont la taille
  de l'écran (402 × 874), en portrait, classe de largeur compacte (iPhone) :
  rien d'anormal à ce niveau, aucune transformation.
- Pourtant, présentée depuis ce contrôleur, la feuille reçoit un cadre faux,
  différent d'un essai à l'autre : 148 × 402, puis 320 × 480 (taille par défaut
  d'une bulle), contenu à moitié dessiné.
- Présentée depuis une **fenêtre à part** (`UIWindow` sur la même scène,
  contrôleur `UIViewController` neuf), la même feuille prend 384 × 367 points
  en bas de l'écran, en entier : c'est la feuille normale d'iOS.
- `UIDocumentInteractionController` (menu d'options d'un document) s'affiche
  aussi correctement.

## Correction (0.8.1)

`src-tauri/ios/Sources/PartagePlugin/PartagePlugin.swift` : à chaque partage,
une fenêtre transparente est posée au-dessus de celle de l'app, avec un
contrôleur neuf qui présente la feuille. À la fin du partage (envoyé, annulé ou
fermé par un toucher à côté), `completionWithItemsHandler` retire cette
fenêtre et rend la main à celle de l'app.

Vérifié sur le simulateur iPhone (`e2e/appareil-ios.mjs`, branche d'essais
`ccr-3626951a-ud6bbr` : seulement les essais du partage) : feuille ouverte
deux fois de suite, « Copy » et « Save to Files » en entier dans l'écran,
feuille fermée, puis l'app répond de nouveau au toucher. Le parcours complet
de l'élève sur le simulateur garde aussi le contrôle après « Créer le PDF ».

À vérifier sur un vrai iPhone par TestFlight : envoi du PDF vers Fichiers et
vers Mail.
