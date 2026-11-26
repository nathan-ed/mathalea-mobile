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

### Pistes retenues par Nathan (à trancher le 27 novembre)

Aucune tournure IA (« conseillé », « en priorité » : refusés). Des mots
d'action simples :

1. **La ceinture blanche a aussi son bouton** : « Commencer » sous la
   ceinture mise en avant, comme les autres lignes (éventuellement plus
   petit que le bouton du bas, ou à sa place).
2. **Les ceintures suivantes disent ce que fait leur bouton** : par exemple
   « Commencer sans avoir fait la ceinture blanche » à la place de
   « Commencer cette ceinture » tant que la ceinture d'avant n'est pas
   obtenue.
3. **Le bouton du bas** : dire ce qu'il commence (« Commencer la ceinture
   blanche ») ou disparaître si chaque ligne a son bouton ; à voir sur les
   captures.

À vérifier en le codant : parcours à paliers (même logique, « Palier 1 »),
parcours dont les ceintures s'ouvrent l'une après l'autre (cadenas, pas de
« Commencer » sur les suivantes), séance en cours, bilan qui renvoie à la
page, suites `ouverture-paliers`, `paliers`, `parcours-az`, `interface`.
