# Revue de l'app et pistes (octobre 2026)

Revue de MathALÉA mobile en 0.3.5 : ce que l'app fait déjà, ce que dit la
recherche sur l'apprentissage des mathématiques, le transfert et la
coopération entre enseignants, et ce qu'on pourrait en tirer. Les pistes
respectent les principes de l'app : hors connexion, aucune donnée qui quitte
l'appareil sans un geste de l'élève, pas de compte ni de serveur.

Les tailles d'effet sont celles des sources (d ou g de Cohen et Hedges ;
0,2 petit, 0,5 moyen, 0,8 grand). Elles viennent d'études très diverses :
elles indiquent une direction, pas un gain garanti.

## 1. En bref : cinq priorités

1. **Révisions espacées et mélangées** (côté élève, sans serveur) : le levier
   le mieux établi qui manque à l'app. Une courte série de révision proposée
   chaque semaine, tirée des objectifs travaillés il y a 1, 3 et 8 semaines,
   avec de nouvelles valeurs.
2. **Retour vers l'enseignant** (bilan par QR ou fichier, déjà étudié dans
   `developpement.md`) : sans lui, l'enseignant ne voit rien, alors que les
   effets mesurés des outils d'entraînement passent beaucoup par
   l'utilisation que fait l'enseignant des résultats.
3. **Coopération autour des résultats** : quand les bilans existent,
   comparer un même parcours dans plusieurs classes, avec notes
   pédagogiques partagées. C'est la collaboration sur l'évaluation qui est la
   plus liée aux progrès en mathématiques.
4. **Boucle corrective des paliers** : après un échec, ressource puis nouvel
   essai sur des valeurs neuves, et contrôle différé quelques jours plus tard.
   C'est le cœur de la pédagogie de la maîtrise, que les paliers et
   ceintures appliquent déjà en partie.
5. **Indice de confiance facultatif** (« sûr / pas sûr ») avant la
   correction : peu coûteux, utile à l'élève (erreurs commises avec
   assurance mieux corrigées) et à l'enseignant (bilan).

## 2. Ce que l'app fait déjà bien

| Ce que fait l'app | Ce que dit la recherche |
| --- | --- |
| Questions à valeurs aléatoires, « tout refaire avec de nouvelles valeurs » | Se tester fait mieux apprendre que relire : g ≈ 0,50 en classe (Yang et al., 2021, 222 études). |
| Score à la **première** vérification | Cohérent avec l'effet de test : c'est l'effort de rappel qui compte, pas la réussite après coup. |
| « Mélanger les questions » (activé par défaut) | Pratique mélangée : d = 0,83 sur un test surprise un mois plus tard (Rohrer et al., 2020, essai randomisé, 787 élèves de 7e année). Le mélange se fait ici dans un parcours : utile, mais l'essentiel vient du mélange **entre chapitres** et de l'espacement (voir 3.1). |
| Paliers à seuil, ressource pour revoir, ceintures | Pédagogie de la maîtrise (Bloom) : d ≈ 0,5 en moyenne (Kulik et al., 1990), surtout pour les élèves faibles ; l'effet tient à la boucle « évaluation, correction, nouvel essai ». |
| Correction après chaque question ou à la fin | Le retour d'information agit (d = 0,48, Wisniewski et al., 2020), d'autant plus qu'il dit **comment** faire, pas seulement juste ou faux. Les corrections de MathALÉA sont détaillées : c'est un atout. |
| Suivi par objectif, « à revoir » | Outils de suivi de ses apprentissages (journaux, grilles) : d = 0,42 sur les résultats (Dignath et van Ee). |
| Pas de classement, pas de compte | Les effets de la ludification sont petits et instables sur la motivation (Sailer et Homner, 2020) ; ne rien perdre en n'ayant pas de classement. |
| Dossiers de collègues, « Éditer un parcours existant », Dupliquer | Les enseignants choisissent des ressources qu'ils peuvent **adapter** plutôt que reprendre telles quelles (Pulker). |

## 3. Pistes pour les élèves

### 3.1 Révisions espacées et mélangées (priorité)

Constat : un parcours se travaille sur une ou deux séances, puis n'est plus
revu. Rien ne ramène l'élève vers ce qu'il a fait il y a un mois.

Recherche :
- Espacement en mathématiques : g = 0,28 sur 27 études (Murray, Horner et
  Göbel, 2025), plus fort hors cours. Effet réel mais modéré.
- Mélange de types de problèmes : d = 0,83 (Rohrer et al., 2020). L'essai
  combinait mélange **et** espacement des révisions : ce qu'il faut viser,
  c'est le couple des deux.
- Les gains apparaissent surtout sur les tests **différés** ; à court terme,
  la pratique en bloc paraît meilleure. Prévenir élèves et enseignants que
  « c'est plus dur, et c'est normal ».

Proposition :
- Une tuile « Révisions » sur l'accueil de l'élève, une fois par semaine :
  8 à 10 questions tirées des objectifs travaillés à J+7, J+21, J+56 (ou
  manqués au dernier passage), d'au moins trois objectifs différents,
  mélangées, avec de nouvelles valeurs. Tout se calcule sur l'appareil à
  partir du suivi et des étapes déjà connues (uuid et réglages).
- Côté enseignant, un réglage par classe : révisions activées, chapitres
  inclus (par défaut, tous les parcours de la classe déjà faits).
- Résultat dans le suivi de l'objectif (« revu le… ») et dans le bilan.

Coût : moyen. Aucun changement du moteur ni du format de parcours (une
révision est un parcours généré localement, comme Teste ton niveau).

### 3.2 Boucle corrective et contrôle différé

Constat : un palier réussi reste acquis. « Reprendre les exercices à
améliorer » existe, mais rien ne vérifie la tenue dans le temps.

Recherche : l'effet de la maîtrise repose sur l'évaluation formative, la
correction, puis une **évaluation parallèle** (Guskey ; Slavin, 1987).
L'étude des exemples erronés (Adams et al., 2014) ne montre l'avantage
qu'au test différé d'une semaine (d = 0,62).

Proposition :
- Échec à un palier : la ressource pour revoir est montrée, puis « Nouvel
  essai » sur des valeurs neuves (et non « Tout refaire »).
- Ceinture ou palier réussi : « à confirmer » ; il rejoint les révisions
  (3.1) et n'est marqué « acquis » qu'après une réussite différée.
- Suivi par objectif : montrer la dernière réussite et sa date plutôt que le
  meilleur niveau seul, qui surestime ce qui tient.

### 3.3 Exemples travaillés et erreurs à corriger

Recherche :
- Exemples travaillés en mathématiques : g = 0,48 (Barbieri et al., 2023,
  55 études). Les consignes d'auto-explication ajoutées n'aident pas en
  moyenne, et les exemples corrects seuls font mieux que les exemples erronés
  seuls.
- Exemples erronés : avantage au test différé (Adams et al., 2014), non
  retrouvé dans une autre étude en classe (2011). Les élèves les aiment
  moins.
- Effet d'inversion selon l'expertise : ce qui aide un débutant gêne un élève
  avancé (Kalyuga).

Proposition :
- Type d'étape « Exemple corrigé » : une question de l'exercice affichée avec
  sa correction, suivie de la même question à faire avec d'autres valeurs.
  Placé en tête d'un palier de découverte, retiré dans les paliers suivants
  (estompage). Le moteur sait déjà produire question et correction.
- « Trouve l'erreur » réservé à l'approfondissement, via les pauses (texte et
  image d'une copie erronée), sans en faire une règle.

### 3.4 Indice de confiance

Recherche : une erreur faite avec assurance est plus souvent corrigée ensuite
(effet d'hypercorrection, retrouvé en classe de mathématiques et sur
7 000 élèves britanniques). En revanche, s'entraîner à prédire sa note
n'améliore pas sa lucidité selon plusieurs études : l'intérêt est la
correction, pas l'exercice de prédiction lui-même.

Proposition : réglage facultatif du parcours, deux boutons « Sûr » / « Pas
sûr » avant « Vérifier ». Bilan : « Erreurs dont tu étais sûr » en tête,
avec leur correction ; ces questions reviennent en priorité dans les
révisions. Pour l'enseignant (bilan) : les questions où la classe se trompe
avec assurance signalent une conception erronée, à traiter en classe.

### 3.5 Transfert

Constat : les exercices de MathALÉA varient les valeurs, rarement la forme ou
le contexte. On entraîne surtout le transfert proche.

Recherche :
- Comparer deux méthodes de résolution côte à côte améliore la précision et
  la flexibilité (Rittle-Johnson et Star) ; mais en classe réelle, les
  enseignants ont peu utilisé le matériel, faute de savoir quoi comparer et
  quand.
- L'échec productif (chercher avant l'explication) aide la compréhension et
  le transfert (Sinha et Kapur, 2021, 53 études), à condition d'une
  explication ensuite.
- Le mélange (3.1) est aussi un entraînement au choix de la méthode, la
  compétence qui manque le plus au transfert.

Proposition :
- Pause « Avant de commencer » : un problème ouvert à chercher sur papier,
  puis la suite du palier (échec productif encadré par l'enseignant).
- Pause « Deux méthodes » : deux corrections côte à côte et une question
  « laquelle choisirais-tu ici ? ». Un modèle de pause tout prêt aide plus
  qu'un champ libre.
- Dans l'éditeur, signaler les exercices d'un même objectif qui changent de
  forme (énoncé, figure, contexte) pour encourager la variété.

### 3.6 Se fixer un but, suivre ses progrès

Recherche : les interventions qui combinent stratégies cognitives,
métacognitives et motivationnelles améliorent les résultats en
mathématiques (Wang et Sperling, 2020) ; les outils de suivi aident surtout
quand ils portent à la fois sur le contenu et sur la façon de travailler.

Proposition : dans le Suivi, un « À revoir cette semaine » (deux ou trois
objectifs choisis par l'élève, ou proposés), et au bilan une phrase de
l'élève « ce que je dois retenir » gardée dans le suivi. Pas de série de
jours consécutifs : elle mesure l'assiduité, pas l'apprentissage, et
décourage après une interruption.

### 3.7 Motivation et messages

Recherche : la ludification a des effets petits (g = 0,49 cognitif,
0,36 motivationnel, instables), et les classements posent des problèmes
connus. Un court message sur l'intelligence qui se développe aide surtout
les élèves faibles, et seulement dans un climat de classe qui valorise
l'effort (Yeager et al., 2019).

Proposition : garder les ceintures (but clair, progression), sans points ni
classement. Bilans formulés sur la progression (« 3 objectifs de plus que
la dernière fois », « cette erreur, tu ne la fais plus ») plutôt que sur le
score seul.

### 3.8 Accessibilité

Recherche : la lecture à voix haute aide nettement en lecture (0,56) et peu
en mathématiques en moyenne (0,13), davantage pour les plus jeunes élèves
en difficulté de lecture (Buzick et Stone, 2014).

Proposition : un bouton « Écouter l'énoncé » (synthèse vocale du système,
hors connexion) pour le CM1 à la 6e et les élèves dyslexiques ; un réglage
de taille du texte. Coût faible ; les formules demandent une lecture adaptée
(texte alternatif de KaTeX ou MathLive).

## 4. Pistes pour la classe

### 4.1 Session partagée : vote, discussion, nouveau vote

Recherche : en physique, « réponse individuelle, discussion par deux, nouveau
vote » donne des gains nets, y compris quand aucun élève du binôme n'avait
juste au départ (Smith et al., 2009). Peu d'études en mathématiques.

Proposition : dans une session partagée, mode « Débat » : chaque élève
répond, la correction est retenue, l'enseignant dit « discutez », puis
nouvelle réponse ; le bilan garde « avant » et « après ». Sans serveur,
l'enseignant voit la répartition à main levée ou par les bilans (5.1).

### 4.2 Évaluation formative en direct

Avec les bilans par QR (5.1), une « question charnière » en fin de séance
(un exercice choisi, réponses scannées en une photo de quatre téléphones,
déjà testé en simulation) dit à l'enseignant s'il peut avancer. C'est
l'usage qui fait l'effet d'ASSISTments : retour immédiat aux élèves **et**
informations organisées pour l'enseignant, avec formation à leur usage
(Roschelle et al., 2016, essai randomisé sur 43 écoles, gains surtout
pour les élèves faibles).

## 5. Pistes pour les enseignants et leur coopération

### 5.1 Retour vers l'enseignant (prérequis)

Le format `bilan-mathalea/1` est décrit dans `developpement.md` (QR ou
fichier, sans réponses, choix de Nathan). La recherche plaide pour en faire
la prochaine grande étape :
- les tableaux de bord ont des effets mal établis sur les résultats ; ce
  qui marche, ce sont des informations **peu nombreuses et actionnables**
  (les enseignants peinent à interpréter des tableaux riches) ;
- dans l'étude de l'usage de Khan Academy, la régularité d'usage fait la
  différence, et seuls 5 % des élèves atteignaient la dose recommandée :
  l'enseignant doit voir qui travaille, sans surveiller en continu.

Proposition d'affichage : par classe et par parcours, trois choses
seulement : qui a fini, les trois questions les moins réussies (avec
« erreur sûre » si 3.4), et les élèves à revoir. Export CSV pour le reste.

### 5.2 Coopération autour des résultats

Recherche :
- La qualité de la collaboration entre enseignants est liée aux progrès des
  élèves, et c'est la collaboration **sur l'évaluation** qui prédit le mieux
  les progrès en mathématiques (Ronfeldt et al., 2015, 9 000 enseignants ;
  étude d'observation).
- L'étude collective de leçons, soutenue par des ressources de qualité, est
  l'une des deux formations en mathématiques (sur 643 étudiées) à avoir
  amélioré les résultats des élèves (Lewis et Perry, 2017).
- Le manuel seul change peu de chose (Blazar et al., 2019) : ce sont les
  usages et l'accompagnement qui comptent.
- Les enseignants adaptent les ressources et partagent peu leurs
  adaptations (Pulker) ; chez Sésamath, c'est la participation à des projets
  communs qui fait vivre la coopération, plus que le dépôt de ressources.

Propositions :
- **Dossier d'équipe** : un dossier partagé où chaque collègue dépose son
  fichier ; l'app les fusionne déjà. Ajouter l'auteur de chaque parcours
  (nom choisi par l'enseignant, facultatif) et « repris de… V3 » quand on
  l'adapte. Quand l'auteur publie une V4, prévenir celui qui a repris.
- **Notes pédagogiques** sur un parcours, visibles des seuls enseignants :
  durée, prérequis, ce qui a marché, erreurs fréquentes. Elles voyagent
  avec le parcours et rendent l'adaptation plus facile.
- **Résultats comparés** (après 5.1) : un même parcours donné dans plusieurs
  classes de l'équipe ; chaque enseignant exporte un résumé anonyme
  (pourcentages par question, sans élèves) dans le dossier d'équipe ; l'app
  montre les questions qui posent problème partout. Base concrète d'une
  heure de concertation, dans l'esprit de l'étude collective de leçons.
- **Objectifs d'équipe** : la liste d'objectifs (CSV) existe déjà ; la
  proposer dans le dossier d'équipe pour que tous étiquettent pareil, et que
  les résultats se comparent.

### 5.3 Création plus rapide

- Modèles de parcours (« Découverte en 3 paliers », « Révision mélangée »,
  « Ceintures sur un chapitre ») qui préremplissent organisation, seuils et
  pauses : l'enseignant n'a plus qu'à choisir les exercices.
- Dans le navigateur d'exercices, filtres « interactif » et « avec figure »,
  et l'aperçu de deux exercices côte à côte.
- QR code du lien du dossier affiché par l'app (aujourd'hui, l'enseignant
  doit le fabriquer ailleurs).

## 6. Revue technique et produit

- **Moteur des boutiques** : la version Google Play prend le moteur de
  mathalea.fr, celle de la forge le moteur du dépôt. Une fonction qui dépend
  du moteur (comme le référentiel de la 0.3.5) arrive donc à des dates
  différentes selon l'installation, et peut même disparaître d'une
  installation de la forge quand mathalea.fr publie un moteur plus récent
  qui ne l'a pas. Tant que la MR du moteur n'est pas fusionnée, ajouter à la
  procédure de release une vérification « fonctions du moteur de l'app
  présentes dans le moteur publié », ou faire refuser par l'app un moteur
  téléchargé qui en a moins que le moteur livré.
- **MR du moteur** : voir la revue du 18 octobre (extraire les fonctions du
  menu du site dans un module commun, formatage Prettier, correctif main
  levée).
- **Bannière de mise à jour de l'app** : notée dans « À faire ».
- **Moteur en ressource Android** (une copie au lieu d'une par
  architecture) : déjà noté, réduirait la taille des APK.
- **Tests** : les e2e se lancent à la main et certains dépendent du dossier
  de démonstration ; un script unique qui démarre les serveurs dans le bon
  ordre (avec ou sans dossier partagé, voir le piège de `papier.mjs`) et
  enchaîne toutes les suites éviterait les faux échecs.
- **Mesures** : rien ne mesure la durée de chargement de l'éditeur ou d'une
  séance sur un téléphone modeste ; un relevé simple à chaque release (APK
  sur l'émulateur) éviterait les régressions.

## 7. Ce que je déconseille

- Classements, points, séries de jours : effets petits et instables, risque
  pour les élèves faibles, et contraire à l'esprit sans compte.
- Indices à la demande jusqu'à la réponse : abus fréquents dans les
  tuteurs (« jusqu'à 36 % des actions » dans une étude), apprentissage faible
  quand on saute jusqu'à la réponse. Préférer l'exemple corrigé (3.3) ou
  l'indice qui n'apparaît qu'après une première erreur.
- Adaptation automatique de la difficulté sans l'enseignant : la difficulté
  « juste » à court terme n'est pas celle qui fait le mieux retenir ; les
  paliers choisis par l'enseignant, plus les révisions, suffisent.
- Tableau de bord riche pour l'enseignant : peu d'effet prouvé, surcharge.

## 8. Feuille de route possible

| Version | Contenu | Raison |
| --- | --- | --- |
| 0.4 | Révisions espacées et mélangées ; boucle corrective des paliers ; bannière de mise à jour | Le plus fort levier, sans dépendance externe |
| 0.5 | Bilan vers l'enseignant (QR et fichier) ; affichage minimal par classe ; indice de confiance | Rend l'enseignant acteur ; prérequis de la coopération |
| 0.6 | Dossier d'équipe (auteur, « repris de… », notes pédagogiques) ; résultats comparés ; modèles de parcours | Coopération sur l'évaluation |
| plus tard | Exemples corrigés en étape ; mode Débat ; lecture à voix haute | Utiles, à valider avec des collègues |

Chaque étape gagnerait à être essayée avec deux ou trois classes avant d'être
généralisée, en regardant surtout les résultats différés (révisions, Teste ton
niveau), pas seulement les scores du jour.

## Sources

- Rohrer, Dedrick, Hartwig et Cheung (2020), essai randomisé sur la pratique
  mélangée : [IES, fiche de l'étude](https://ies.ed.gov/ncee/wwc/Study/88770),
  [briefing Structural Learning](https://www.structural-learning.com/research-briefings/mix-it-up)
- Murray, Horner et Göbel (2025), espacement en mathématiques :
  [White Rose](https://eprints.whiterose.ac.uk/id/eprint/229807)
- Yang, Luo, Vadillo, Yu et Shanks (2021), quiz en classe :
  [HKBU](https://scholars.hkbu.edu.hk/en/publications/testing-quizzing-boosts-classroom-learning-a-systematic-and-meta-/)
- Wisniewski, Zierer et Hattie (2020), retour d'information :
  [Frontiers in Psychology](https://www.frontiersin.org/articles/10.3389/fpsyg.2019.03087/full)
- Barbieri et al. (2023), exemples travaillés en mathématiques :
  [Learning Scientists](https://www.learningscientists.org/blog/2024/1/25-1),
  [poster de l'université du Delaware](https://www.cehd.udel.edu/wp-content/uploads/2022/02/Worked-Examples-Meta-Poster_022722_SC.pdf)
- Kulik, Kulik et Bangert-Drowns (1990) ; Guskey ; Slavin (1987), pédagogie
  de la maîtrise : [Slavin 1987](https://Www.Gwern.net/doc/psychology/1987-slavin.pdf),
  [méta-analyse (academia)](https://www.academia.edu/81783373/Effectiveness_of_Mastery_Learning_Programs_A_Meta_Analysis)
- Roschelle, Feng, Murphy et Mason (2016), ASSISTments :
  [SRI](https://www.sri.com/publication/education-learning-pubs/online-mathematics-homework-increases-student-achievement/)
- Rittle-Johnson, Star et Durkin, comparaison de méthodes :
  [chapitre 2017](https://cdn.vanderbilt.edu/t2-my/my-prd/wp-content/uploads/sites/3147/2020/01/RittleJohnson_Star_Durkin_2017_ComparisonChapter.pdf),
  [Harvard GSE](https://www.gse.harvard.edu/ideas/usable-knowledge/15/04/multiple-methods)
- Sinha et Kapur (2021), échec productif :
  [Forum économique mondial](https://www.weforum.org/stories/education-and-skills/students-who-productively-fail-learn-more/),
  [Columbia EPIC](https://epic.tc.columbia.edu/research/academic-alert/blog-posts/2022/is-failure-necessary-for-problem-solving)
- Adams, McLaren et al. (2014), exemples erronés :
  [DFKI](https://dfki.de/web/forschung/projekte-publikationen/publikation/8598),
  [Learning Scientists](https://www.learningscientists.org/blog/2023/7/27)
- Hypercorrection en classe :
  [PubMed](https://pubmed.ncbi.nlm.nih.gov/29781391/),
  [Loughborough, questions diagnostiques](https://repository.lboro.ac.uk/articles/journal_contribution/School_students_confidence_when_answering_diagnostic_questions_online/14867178),
  [Eedi](https://eedi.substack.com/p/what-do-4-million-students-responses)
- Dignath et van Ee ; Wang et Sperling (2020), autorégulation :
  [Frontiers in Education](https://www.frontiersin.org/articles/10.3389/feduc.2020.00058/text)
- Sailer et Homner (2020), ludification :
  [Educational Psychology Review](https://link.springer.com/article/10.1007/s10648-019-09498-w)
- Yeager et al. (2019), état d'esprit de croissance :
  [Harvard Kennedy School](https://www.hks.harvard.edu/publications/national-experiment-reveals-where-growth-mindset-improves-achievement)
- Pellegrini, Lake, Neitzel et Slavin (2021), programmes en mathématiques :
  [Stanford NSSA](https://nssa.stanford.edu/studies/effective-programs-elementary-mathematics-meta-analysis)
- Crouch et Mazur (2001) ; Smith et al. (2009), instruction par les pairs :
  [Mazur](https://mazur.harvard.edu/publications/peer-instruction-ten-years-experience-and-results),
  [Derek Bruff sur Smith et al.](https://derekbruff.org/2009/01/08/article-smith-et-al-2009)
- Indices et contournement dans les tuteurs :
  [LearnLab, Help abuse](https://learnlab.org/research/wiki/index.php/Help_abuse)
- Effet d'inversion selon l'expertise (Kalyuga, 2007) :
  [article](https://www.uky.edu/~gmswan3/EDC608/Kalyuga2007_Article_ExpertiseReversalEffectAndItsI.pdf)
- Khan Academy et NWEA (2022), usage et progrès :
  [Fordham Institute](https://fordhaminstitute.org/national/commentary/accelerating-math-achievement-through-customized-practice)
- Tableaux de bord d'apprentissage :
  [revue (arXiv)](https://arxiv.org/pdf/2312.15042),
  [FU Berlin](https://refubium.fu-berlin.de/handle/fub188/43941?show=full)
- Ronfeldt, Farmer, McQueen et Grissom (2015), collaboration entre
  enseignants : [AERJ](https://journals.sagepub.com/doi/10.3102/0002831215585562),
  [Université du Michigan](https://news.umich.edu/?p=22990)
- Lewis et Perry (2017), étude collective de leçons :
  [NCTM, JRME](https://nctm.org/Publications/Journal-for-Research-in-Mathematics-Education/2017/Vol48/Issue3/Lesson-Study-to-Scale-Up-Research-Based-Knowledge_-A-Randomized,--Controlled-Trial-of-Fractions-Learning)
- Blazar, Kane et al. (2019), manuels : [Harvard CEPR](https://cepr.harvard.edu/curriculum)
- Pulker, adaptation des ressources libres :
  [Open University](https://oro.open.ac.uk/62109)
- Sésamath, conception collective :
  [Gueudet et Trouche (2009)](https://ife.ens-lyon.fr/lea/publications/analyse-du-reseau/articles-scientifiques/conception-et-usages-des-ressources-pour-et-par-les-professeurs-gueudet-et-trouche-2009),
  [IREM de Grenoble](https://irem.univ-grenoble-alpes.fr/medias/fichier/iwr09010_1704835421864-pdf)
- Buzick et Stone (2014), lecture à voix haute :
  [ASHA](https://apps.asha.org/EvidenceMaps/Articles/ArticleSummary/527e5ed2-1fd9-4abb-97fe-a9e7f93978d9)
- Éduscol, automatismes et activités rituelles :
  [document](https://eduscol.education.fr/document/24577/download)
