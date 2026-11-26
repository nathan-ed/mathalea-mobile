# À faire après la 0.8.0

Notes du 26 novembre 2026 au soir, à reprendre le lendemain avec Nathan.
Rien n'est codé.

## 1. Feuille de partage de l'iPhone (PDF, fichiers exportés)

Sur iPhone (iOS 26), la feuille de partage s'ouvre dans une bulle qui part du
coin en bas à droite, à moitié hors de l'écran (photo de Nathan, 0.8.0). La
correction de la 0.6.1 n'avait été vérifiée que sur iPad. Le simulateur
iPhone du workflow `emulateurs` reproduit le défaut ; résultats des essais :
`docs/partage-iphone.md`. La 0.8.1 (déjà numérotée sur la branche) attend
cette correction.

## 2. Page du parcours : par quelle ceinture commencer ?

Constat de Nathan (capture Android, parcours « Dérivation », 5 ceintures
ouvertes à tout moment) : on ne comprend pas qu'il faut d'abord faire la
ceinture blanche.

- La ceinture blanche est mise en avant (fond gris), mais elle est la seule
  sans « Commencer cette ceinture » : son action est le grand bouton du bas,
  « Commencer », qui ne dit pas ce qu'il commence.
- Les ceintures suivantes ont toutes « Commencer cette ceinture » : elles
  ont l'air d'être le chemin normal, la blanche a l'air d'être déjà faite
  ou à part.
- « Ouvert à tout moment » dit qu'on peut, pas ce qui est conseillé.

### Pistes (à choisir ensemble)

1. **Le bouton du bas dit ce qu'il commence** : « Commencer la ceinture
   blanche » (« Continuer la ceinture blanche » pour une séance en cours).
   C'est le changement le plus simple et il lève l'ambiguïté du bouton seul.
2. **La ceinture mise en avant dit qu'elle vient d'abord** : « À faire en
   premier » à la place de « À faire ».
3. **Les ceintures ouvertes à tout moment situent leur place** : sous la
   ceinture jaune, « Conseillé après la ceinture blanche » à la place de
   « Ouvert à tout moment », en gardant « Commencer cette ceinture » (on peut
   toujours la faire tout de suite).
4. Proposée par Nathan : sur la ceinture mise en avant, un lien « Commencer
   cette ceinture » comme sur les autres, pour que toutes les lignes se lisent
   de la même façon. À peser avec le bouton du bas, qui ferait alors doublon
   (deux boutons pour la même action sur un même écran).
5. Proposée par Nathan : en commençant une ceinture plus loin que la
   ceinture conseillée, un court message (« La ceinture blanche est conseillée
   d'abord »). Plutôt dans la ligne (piste 3) qu'en fenêtre à confirmer, qui
   ajouterait un toucher à chaque fois.

Recommandation pour en discuter : 1 + 2 + 3, sans doublon de bouton.

À vérifier en le codant : parcours à paliers (même logique, « Palier 1 »),
parcours dont les ceintures s'ouvrent l'une après l'autre (cadenas, pas de
« Commencer » sur les suivantes), séance en cours, bilan qui renvoie à la
page, suites `ouverture-paliers`, `paliers`, `parcours-az`, `interface`.
