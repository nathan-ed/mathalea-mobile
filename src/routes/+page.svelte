<script lang="ts">
  import { onMount } from 'svelte'
  import { couleurCeinture, ficheDe, nomPalier, paliersDe, type Fiche, type Parcours } from '$lib/catalogue'
  import { formuleBrute, type RenduFormule } from '$lib/texteRiche'
  import { CLE_FICHES, type FicheDuParcours } from '$lib/fiches'
  import Fiches from '$lib/ui/Fiches.svelte'
  import { CLE_AVANT_RESTAURATION, apercuFusion, exporterSauvegarde, fusionnerSauvegarde, restaurerSauvegarde, resumerSauvegarde } from '$lib/sauvegarde'
  import { chargerMoteur, chercherMiseAJourMoteur, infoMoteur, misesAJourMoteur, type Moteur, type Pays } from '$lib/moteur'
  import { dansTauri } from '$lib/stockage'
  import { enregistrerFichier } from '$lib/fichiers'
  import { exporter, lireBibliotheque } from '$lib/bibliotheque'
  import { heure, suivreHeure } from '$lib/heure.svelte'
  import { acquisDe, ceinturesObtenues, conditionPalier, etatsPaliers, type Objectif } from '$lib/objectifs'
  import { ecrireClasses, fusionnerCatalogues, lienDeClasse, lireClasses, lireExplorer, sourcesExplorer, nomHorodate, memeClasse, separerClasse, synchroniserClasse, type Classe } from '$lib/partage'
  import { arborescence, reperesDu, reperesParDefaut, type Repere } from '$lib/explorer'
  import {
    bilan,
    ecrireSeance,
    etapesAAmeliorer,
    lireHistorique,
    lireResultats,
    lireSeance,
    nouvelleSeance,
    premiersEssais,
    questionsDe,
    questionsOrdonnees,
    terminerSeance,
    supprimerSeance,
    type ResultatEtape,
    type Seance as TSeance,
  } from '$lib/progression'
  import { ouvrirStockage, type Stockage } from '$lib/stockage'
  import Accueil, { type Resume, type Source } from '$lib/ui/Accueil.svelte'
  import type { Organisation } from '$lib/ui/ContenuClasse.svelte'
  import Bilan from '$lib/ui/Bilan.svelte'
  import Cours from '$lib/ui/Cours.svelte'
  import ChoixProfil from '$lib/ui/ChoixProfil.svelte'
  import DetailParcours from '$lib/ui/DetailParcours.svelte'
  import Reglages from '$lib/ui/Reglages.svelte'
  import Relecture from '$lib/ui/Relecture.svelte'
  import Scanner from '$lib/ui/Scanner.svelte'
  import EcranRevisions from '$lib/ui/Revisions.svelte'
  import {
    aRevoir,
    barrettes,
    TAILLE_PAR_DEFAUT,
    estRevision,
    ID_REVISIONS,
    integrerPassages,
    prochaineRevision,
    quand as quandRevision,
    resultatsRevision,
    revisionsVides,
    tirerRevision,
    type Revisions,
  } from '$lib/revisions'
  import Feuille from '$lib/ui/Feuille.svelte'
  import { boutonAction, boutonInverse } from '$lib/ui/classes'
  import { decoderClasse, decoderInvitation, moteurPlusAncien, type InvitationSession } from '$lib/invitation'
  import Seance from '$lib/ui/Seance.svelte'
  import Suivi from '$lib/ui/Suivi.svelte'
  import TestNiveau from '$lib/ui/TestNiveau.svelte'
  import ChoixEnregistrement from '$lib/ui/ChoixEnregistrement.svelte'
  import { NB_QUESTIONS, NIVEAUX_TEST, SEUIL_TEST, ceintureDu, couleurDu, estTest, niveauDuTest, presenterTest, sujetsDu, tirerTest, type EtatTest } from '$lib/testNiveau'
  import type { ExerciceDuReferentiel } from '$lib/moteur'
  import { navigation, retourDeBase } from '$lib/navigation.svelte'

  type Vue = 'accueil' | 'parcours' | 'seance' | 'bilan' | 'reglages' | 'relecture' | 'test' | 'revisions' | 'cours'

  let stockage: Stockage | undefined
  let pret = $state(false)
  let moteur: Moteur | undefined = $state()
  let erreurMoteur = $state('')
  // Premier lancement passé (programme choisi) ; « enseignant » d'avant la 0.6 vaut élève
  let profil: string | null = $state(null)
  let pays: Pays = $state('FR')
  let vue: Vue = $state('accueil')
  type Onglet = 'mes' | 'explorer' | 'suivi' | 'fiches'
  let onglet: Onglet = $state('mes')
  let actif: Parcours | undefined = $state()
  // Fiche de cours ouverte, l'écran d'où elle vient et, avant une séance, de quoi la lancer
  let cours: { fiche: Fiche; depuis: Vue; ensuite?: () => void } | null = $state(null)
  let fichesVues: string[] = $state([]) // fiches déjà montrées d'office (« id#palier »)
  let fichesEnregistrees: FicheDuParcours[] = $state([]) // onglet Fiches, dans l'ordre de l'élève
  // Formules des fiches : KaTeX du moteur (centrées : style « display »)
  const formule: RenduFormule = $derived((latex: string, centree: boolean) =>
    moteur?.titreHtml ? moteur.titreHtml(`$${centree ? '\\displaystyle ' : ''}${latex}$`) : formuleBrute(latex, centree),
  )
  function ouvrirCours(fiche: Fiche, ensuite?: () => void) {
    cours = { fiche, depuis: vue, ensuite }
    aller('cours')
  }
  let seance: TSeance | undefined = $state()
  let relue: TSeance | undefined = $state()
  let seances: Record<string, TSeance | null> = $state({})
  let resultats: Record<string, Record<number, ResultatEtape>> = $state({})
  let historiques: Record<string, TSeance[]> = $state({})
  let derniersComplets: Record<string, number | null> = $state({})
  let classes: Classe[] = $state([])
  let epingles: string[] = $state([])
  // Parcours cachés de l'accueil (élève) : rangés en bas, remis d'un toucher
  let caches: string[] = $state([])
  // L'élève a dit ne pas avoir de lien de classe : l'accueil ne le lui demande plus
  let sansLien = $state(false)
  let organisations: Record<string, Organisation> = $state({})
  let miseAJourMoteur: string | null = $state(null)
  // Versions des boutiques : moteur livré seulement (pas de recherche de mise à jour)
  let moteurMisAJour = $state(false)

  let rechercheMoteur: Promise<string> | null = null
  /** Mise à jour du moteur : installée en arrière-plan, utilisée au prochain lancement */
  function chercherMoteur(): Promise<string> {
    // Une seule recherche à la fois (automatique et bouton des réglages)
    rechercheMoteur ??= rechercherMoteur().finally(() => (rechercheMoteur = null))
    return rechercheMoteur
  }
  async function rechercherMoteur(): Promise<string> {
    try {
      const version = await chercherMiseAJourMoteur()
      if (version) miseAJourMoteur = version
      return version ? '' : 'Le moteur est à jour.'
    } catch (e) {
      console.warn('Mise à jour du moteur', e)
      return 'Mise à jour impossible pour le moment (connexion ou serveur indisponible).'
    }
  }
  // L'élève choisit sa classe dans un dossier qui en a plusieurs
  const aChoisir = $derived(classes.filter((c) => !c.nom && c.disponibles.length > 1).map((c) => ({ lien: c.lien, disponibles: c.disponibles })))
  // Bibliothèque d'un enseignant d'avant la 0.6 : exportable pour la page Parcours du site
  let bibliothequeExportable = $state(false)
  // Aucun parcours intégré : tout vient des dossiers partagés
  const sources: Source[] = $derived(classes.filter((c) => c.nom).map((c) => ({ id: c.lien, nom: c.nom, parcours: c.parcours })))
  // Explorer : catalogue de l'équipe MathALÉA (dernière copie reçue des dossiers kDrive) et parcours ajoutés à l'accueil
  let catalogue: Parcours[] | null = $state(null)
  // Dernière lecture des dossiers de l'Explorer : en cours, réussie, ou impossible (hors connexion)
  let etatExplorer: 'lecture' | 'lu' | 'injoignable' = $state('lecture')
  /** Copie de l'accueil remplacée par la version du catalogue si elle est plus récente */
  const plusRecent = (a: Parcours) => {
    const c = catalogue?.find((p) => p.id === a.id)
    return c && c.version > a.version ? c : a
  }
  // Degrés et chapitres du référentiel du pays (moteur), pour ranger l'Explorer ; degré et chapitre ouverts
  let reperes: Repere[] | null = $state(null)
  const explorer = $derived(arborescence(catalogue ?? [], pays, reperes ?? reperesParDefaut(pays)))
  let explorerNiveau: string | null = $state(null)
  async function lireReperes() {
    const p = pays
    try {
      const r = reperesDu((await suivre(moteur?.listerExercices(p) ?? Promise.resolve([]))) ?? [])
      if (p === pays) reperes = r.length ? r : null
    } catch (e) {
      console.warn('Référentiel', e)
    }
  }
  let ajoutes: Parcours[] = $state([])
  const tous: Parcours[] = $derived.by(() => {
    const vus = new Map<string, Parcours>()
    for (const s of sources) for (const p of s.parcours) vus.set(p.id, p)
    for (const p of ajoutes) if (!vus.has(p.id)) vus.set(p.id, p)
    return [...vus.values()]
  })
  // Onglet Fiches : dépliés et recherche gardés au retour d'une fiche
  let fichesOuvertes: string[] = $state([])
  let rechercheFiches = $state('')
  const dansSources = (id: string) => sources.some((s) => s.parcours.some((p) => p.id === id))
  const totalQuestions = (p: Parcours) => p.etapes.reduce((a, e) => a + (e.nbQuestions ?? 0), 0)

  const resumes = $derived.by(() => {
    const r: Record<string, Resume> = {}
    for (const p of tous) {
      const s = seances[p.id]
      const enCours = !!s && !s.fin
      r[p.id] = {
        // Questions répondues, plus celles sur papier dont la correction a été vue
        fait: enCours && s ? premiersEssais(s).size + Object.values(s.papier ?? {}).filter(Boolean).length : 0,
        sur: enCours && s ? questionsDe(s).length || totalQuestions(p) : totalQuestions(p),
        enCours,
        pourcentage: derniersComplets[p.id] ?? null,
        ...(paliersDe(p).length > 1
          ? { paliers: { reussis: ceinturesObtenues(p, historiques[p.id] ?? []).filter((x) => x.obtenue).length, total: paliersDe(p).length } }
          : {}),
      }
    }
    return r
  })

  async function chargerParcours(p: Parcours) {
    seances[p.id] = await lireSeance(stockage!, p.id)
    resultats[p.id] = await lireResultats(stockage!, p)
    historiques[p.id] = await lireHistorique(stockage!, p.id)
    derniersComplets[p.id] = await stockage!.lire<number>(`complet:${p.id}`)
  }

  // Travail en cours (démarrage, référentiel, relecture des dossiers et de
  // l'Explorer) : aria-busy sur la colonne, le contenu peut encore changer
  let travaux = $state(1)
  async function suivre<T>(travail: Promise<T>): Promise<T> {
    travaux++
    try {
      return await travail
    } finally {
      travaux--
    }
  }

  onMount(async () => {
    try {
      await demarrer()
    } finally {
      travaux--
    }
  })
  async function demarrer() {
    stockage = await ouvrirStockage()
    profil = await stockage.lire<string>('profil')
    pays = (await stockage.lire<Pays>('pays')) ?? 'FR'
    classes = await lireClasses(stockage)
    epingles = (await stockage.lire<string[]>('epingles')) ?? []
    caches = (await stockage.lire<string[]>('caches')) ?? []
    sansLien = (await stockage.lire<boolean>('sans-lien')) ?? false
    fichesVues = (await stockage.lire<string[]>('fiches-vues')) ?? []
    fichesEnregistrees = (await stockage.lire<FicheDuParcours[]>(CLE_FICHES)) ?? []
    organisations = (await stockage.lire<Record<string, Organisation>>('chapitres')) ?? {}
    // Copie du catalogue reçue la dernière fois : l'Explorer s'affiche aussitôt, même hors connexion
    catalogue = await stockage.lire<Parcours[]>('explorer')
    // Copie reçue pour l'autre pays : pas montrée (le dossier décide du pays)
    const paysCopie = await stockage.lire<Pays>('explorer-pays')
    if (paysCopie && paysCopie !== pays) catalogue = null
    // Un test ajouté à l'accueil par une version précédente : il vit dans Teste ton niveau.
    // Un parcours de l'Explorer ajouté à l'accueil suit sa nouvelle version (mise à jour de l'app)
    ajoutes = ((await stockage.lire<Parcours[]>('ajoutes')) ?? []).filter((p) => !estTest(p.id)).map((a) => plusRecent(a))
    bibliothequeExportable = (await lireBibliotheque(stockage)).parcours.length > 0
    etatTest = (await stockage.lire<EtatTest>('test-niveau')) ?? {}
    for (const e of Object.values(etatTest)) if (e.tirage) e.tirage = presenterTest(e.tirage)
    for (const e of Object.values(etatTest)) if (e.tirage) await chargerParcours(e.tirage)
    for (const p of catalogue ?? []) await chargerParcours(p)
    restaurationAnnulable = !!(await stockage.lire<string>(CLE_AVANT_RESTAURATION))
    for (const p of tous) await chargerParcours(p)
    await chargerRevisions()
    // Écran où l'on était à la dernière fermeture, lu avant que l'accueil ne l'écrase
    const ecranAvant = await stockage.lire<Ecran>('ecran')
    vue = 'accueil'
    pret = true
    try {
      moteurMisAJour = await misesAJourMoteur()
      moteur = await chargerMoteur()
      moteur.definirLangue(pays === 'CH' ? 'fr-CH' : 'fr-FR')
      void lireReperes()
      if (ecranAvant) await reprendreEcran(ecranAvant)
    } catch (e) {
      erreurMoteur = (e as Error).message
    }
    actualiser()
  }

  // Parcours des dossiers suivis, Explorer et moteur : relus au lancement, à chaque retour
  // dans l'app, au retour de la connexion et toutes les 10 minutes tant qu'elle est affichée
  const ECART_MINIMUM = 60_000
  let actualiseLe = 0
  let actualisation: Promise<unknown> | null = null
  function actualiser() {
    if (!pret || actualisation || Date.now() - actualiseLe < ECART_MINIMUM) return
    actualiseLe = Date.now()
    actualisation = suivre(Promise.all([
      classes.length ? synchroniserClasses() : null,
      synchroniserExplorer(),
      moteur && moteurMisAJour ? chercherMoteur() : null,
    ])).finally(
      () => (actualisation = null),
    )
  }
  onMount(() => {
    const auPremierPlan = () => {
      if (document.visibilityState === 'visible') actualiser()
    }
    const minuteur = setInterval(auPremierPlan, 10 * 60_000)
    document.addEventListener('visibilitychange', auPremierPlan)
    window.addEventListener('online', auPremierPlan)
    const arreterHeure = suivreHeure()
    return () => {
      arreterHeure()
      clearInterval(minuteur)
      document.removeEventListener('visibilitychange', auPremierPlan)
      window.removeEventListener('online', auPremierPlan)
    }
  })

  /** Catalogue relu sur les dossiers de l'Explorer ; les parcours ajoutés suivent leur nouvelle version */
  let lectureExplorer: Promise<void> | null = null
  function synchroniserExplorer(): Promise<void> {
    lectureExplorer ??= lireCatalogue().finally(() => (lectureExplorer = null))
    return lectureExplorer
  }
  async function lireCatalogue() {
    const lu = pays
    etatExplorer = 'lecture'
    try {
      const recu = await lireExplorer(sourcesExplorer(lu))
      // Pays changé pendant la lecture : changerPays relit le bon dossier
      if (pays !== lu) return
      // Un dossier illisible : ses parcours restent ceux de la copie
      const liste = recu.complet ? recu.parcours : fusionnerCatalogues(catalogue ?? [], recu.parcours)
      catalogue = liste
      etatExplorer = recu.complet ? 'lu' : 'injoignable'
      await stockage!.ecrire('explorer', $state.snapshot(liste))
      await stockage!.ecrire('explorer-pays', lu)
      ajoutes = ajoutes.map((a) => plusRecent(a))
      await stockage!.ecrire('ajoutes', $state.snapshot(ajoutes))
      for (const p of [...ajoutes, ...liste]) await chargerParcours(p)
    } catch (e) {
      // Hors connexion ou dossier indisponible : la copie de l'appareil reste affichée
      console.warn('Explorer', e)
      if (pays === lu) etatExplorer = 'injoignable'
    }
  }

  async function basculerAjout(p: Parcours) {
    if (estTest(p.id)) return
    ajoutes = ajoutes.some((a) => a.id === p.id) ? ajoutes.filter((a) => a.id !== p.id) : [...ajoutes, p]
    await stockage!.ecrire('ajoutes', $state.snapshot(ajoutes))
    await chargerParcours(p)
  }

  /** Explorer, élève : plusieurs parcours ajoutés à l'accueil d'un coup */
  async function ajouterPlusieurs(liste: Parcours[]) {
    const nouveaux = liste.filter((p) => !estTest(p.id) && !ajoutes.some((a) => a.id === p.id))
    ajoutes = [...ajoutes, ...nouveaux]
    await stockage!.ecrire('ajoutes', $state.snapshot(ajoutes))
    for (const p of nouveaux) await chargerParcours(p)
  }

  /** Explorer, élève : parcours retirés de l'accueil et de ses épingles */
  async function retirerPlusieurs(liste: Parcours[]) {
    const ids = liste.map((p) => p.id)
    ajoutes = ajoutes.filter((a) => !ids.includes(a.id))
    await stockage!.ecrire('ajoutes', $state.snapshot(ajoutes))
    if (epingles.some((id) => ids.includes(id))) {
      epingles = epingles.filter((id) => !ids.includes(id))
      await stockage!.ecrire('epingles', epingles)
    }
    // Remis plus tard depuis l'Explorer : il revient visible
    if (caches.some((id) => ids.includes(id))) {
      caches = caches.filter((id) => !ids.includes(id))
      await stockage!.ecrire('caches', caches)
    }
  }

  async function changerPays(p: Pays) {
    const autre = p !== pays
    pays = p
    moteur?.definirLangue(p === 'CH' ? 'fr-CH' : 'fr-FR')
    reperes = null
    explorerNiveau = null
    void lireReperes()
    await stockage!.ecrire('pays', p)
    if (!autre) return
    // L'Explorer de l'autre pays : son dossier, relu après une lecture en cours
    catalogue = null
    void (async () => {
      await lectureExplorer
      await synchroniserExplorer()
    })()
  }

  // Profondeur de chaque écran : un écran plus profond arrive par la droite, un retour par la gauche
  const PROFONDEUR: Record<Vue, number> = { accueil: 0, reglages: 1, parcours: 1, test: 1, revisions: 1, seance: 2, relecture: 2, bilan: 2, cours: 2 }
  let sens: 'avant' | 'arriere' = $state('avant')

  function aller(v: Vue) {
    sens = PROFONDEUR[v] < PROFONDEUR[vue] ? 'arriere' : 'avant'
    vue = v
    scrollTo(0, 0)
  }

  const accueil = () => aller('accueil')

  // Reprise après une fermeture (Android arrête l'app laissée en arrière-plan) :
  // retour sur l'écran où l'on était, une séance en cours reprend à sa question
  type Ecran = { vue: Vue; onglet: Onglet; parcours?: string }
  $effect(() => {
    if (!pret || !stockage) return
    void stockage.ecrire('ecran', { vue, onglet, parcours: actif?.id } satisfies Ecran)
  })
  async function reprendreEcran(e: Ecran) {
    if (profil === null) return
    // Onglets d'avant la 0.6 (enseignant) : l'accueil
    if (['mes', 'explorer', 'suivi', 'fiches'].includes(e.onglet)) onglet = e.onglet
    const tests = NIVEAUX_TEST.flatMap((n) => etatTest[n.cle]?.tirage ?? [])
    const p = e.parcours ? [...tous, ...(catalogue ?? []), ...tests].find((x) => x.id === e.parcours) : undefined
    if (e.vue === 'test') return testPropose ? ouvrirTest() : undefined
    if (!p || !['parcours', 'seance', 'bilan', 'relecture'].includes(e.vue)) return
    const s = seances[p.id]
    if (e.vue === 'seance' && s && !s.fin) {
      actif = p
      return lancer(s)
    }
    if (estTest(p.id)) return ouvrirTest()
    ouvrir(p)
  }
  navigation.versAccueil = () => {
    onglet = 'mes'
    accueil()
  }

  // Écran de lancement (app.html) : retiré quand le moteur est prêt ou en erreur
  $effect(() => {
    if (!((moteur && pret) || erreurMoteur)) return
    const lancement = document.getElementById('lancement')
    lancement?.classList.add('fini')
    setTimeout(() => lancement?.remove(), 250)
  })

  // Bouton retour du téléphone : écran précédent (séance et éditeur ont leur propre garde-fou)
  $effect(() => {
    const precedent: Partial<Record<Vue, () => void>> = {
      reglages: accueil,
      parcours: accueil,
      relecture: () => aller('parcours'),
      seance: quitterSeance,
      bilan: quitterSeance,
      test: accueil,
    }
    retourDeBase(profil !== null ? (precedent[vue] ?? null) : null)
  })

  // ---------- Teste ton niveau ----------

  let etatTest: EtatTest = $state({})
  // Sujets de la CAN du référentiel (lus à la première ouverture du test)
  let referentielCan: ExerciceDuReferentiel[] | null = $state(null)
  const disponiblesTest = $derived(referentielCan ? Object.fromEntries(NIVEAUX_TEST.map((n) => [n.cle, sujetsDu(n, referentielCan!).length])) : null)
  const enCoursTest = $derived(Object.fromEntries(NIVEAUX_TEST.map((n) => [n.cle, !!etatTest[n.cle]?.tirage && !!seances[etatTest[n.cle].tirage!.id] && !seances[etatTest[n.cle].tirage!.id]!.fin])))
  // Dernière ceinture obtenue, pour la tuile de l'Explorer
  const resumeTest = $derived.by(() => {
    const rang = NIVEAUX_TEST.findLastIndex((n) => etatTest[n.cle]?.valideLe)
    return rang >= 0 ? `${ceintureDu(rang)} · ${NIVEAUX_TEST[rang].nom} validé` : 'Du CM1 à la Terminale'
  })
  // Ceintures du test pour le Suivi : toutes, obtenues ou non, dès qu'un test a été passé
  // Teste ton niveau : niveaux français (CM1 à Terminale), seulement en France
  // (Nathan, 1er novembre 2026 : en Suisse, on ne le propose pas)
  const testPropose = $derived((pays as Pays) !== 'CH')
  const ceinturesTest = $derived(
    NIVEAUX_TEST.some((n) => etatTest[n.cle]?.tirage)
      ? NIVEAUX_TEST.map((n, rang) => ({ nom: ceintureDu(rang), niveau: n.nom, couleur: couleurDu(rang), obtenue: !!etatTest[n.cle]?.valideLe }))
      : [],
  )
  // Suivi : parcours des dossiers, de l'Explorer (même non ajoutés) et tests passés
  const parcoursSuivis: Parcours[] = $derived.by(() => {
    const vus = new Map(tous.map((p) => [p.id, p]))
    for (const p of [...(catalogue ?? []), ...NIVEAUX_TEST.flatMap((n) => etatTest[n.cle]?.tirage ?? [])]) if (!vus.has(p.id)) vus.set(p.id, p)
    return [...vus.values()]
  })

  function ouvrirTest() {
    aller('test')
  }
  // Sujets lus dès que l'écran des niveaux s'affiche, quel que soit le chemin
  // (séance de test reprise au relancement puis tentative supprimée : l'écran
  // restait sur « Lecture des sujets… »)
  let lectureCan = false
  $effect(() => {
    if (vue !== 'test' || referentielCan || !moteur || lectureCan) return
    lectureCan = true
    // Référentiel français quel que soit le pays (la CAN n'existe que là)
    void moteur
      .listerExercices('FR')
      .then((liste) => (referentielCan = liste.filter((e) => e.niveau === 'CAN')))
      .finally(() => (lectureCan = false))
  })

  async function sauverTest() {
    await stockage!.ecrire('test-niveau', $state.snapshot(etatTest))
  }

  /** Nouveau tirage d'un niveau, puis le test */
  async function lancerTest(rang: number) {
    if (!moteur || !referentielCan) return
    const n = NIVEAUX_TEST[rang]
    const avant = etatTest[n.cle]
    const p = tirerTest(n, sujetsDu(n, referentielCan), `${Date.now()}-${Math.random()}`, (avant?.tirage?.version ?? 0) + 1)
    etatTest[n.cle] = { ...avant, tirage: p, reperage: undefined }
    await sauverTest()
    await chargerParcours(p)
    actif = p
    void lancer(nouvelleSeance(p, moteur.VERSION_MOTEUR, 'complet'))
  }

  function reprendreTest(rang: number) {
    const p = etatTest[NIVEAUX_TEST[rang].cle]?.tirage
    const s = p ? seances[p.id] : null
    if (!p || !s || s.fin) return
    actif = p
    void lancer(s)
  }

  // Passage complet réussi : la ceinture est obtenue
  const testReussi = (s: TSeance) => s.etapes.length === s.contenu.etapes.length && bilan(s).pourcentage >= SEUIL_TEST

  async function noterTest(s: TSeance) {
    const n = NIVEAUX_TEST[niveauDuTest(s.parcours)]
    if (!n || !testReussi(s)) return
    etatTest[n.cle] = { ...etatTest[n.cle], valideLe: s.fin }
    await sauverTest()
  }

  /** Verdict du bilan d'un test et suites proposées */
  const testDuBilan = $derived.by(() => {
    if (!seance || !seance.fin || !estTest(seance.parcours)) return null
    const rang = niveauDuTest(seance.parcours)
    if (rang === -1) return null
    const ouvert = (i: number) => (disponiblesTest?.[NIVEAUX_TEST[i].cle] ?? 0) > 0
    const suivant = NIVEAUX_TEST.findIndex((_, i) => i > rang && ouvert(i))
    const precedent = NIVEAUX_TEST.findLastIndex((_, i) => i < rang && ouvert(i))
    const ceinture = ceintureDu(rang).toLowerCase()
    const retour = { libelle: 'Retour aux niveaux', fn: () => aller('test') }
    if (testReussi(seance))
      return {
        message: `${ceintureDu(rang)} obtenue : niveau ${NIVEAUX_TEST[rang].nom} validé.`,
        actions: [...(suivant >= 0 ? [{ libelle: `Niveau suivant : ${NIVEAUX_TEST[suivant].nom}`, fn: () => void lancerTest(suivant) }] : []), retour],
      }
    return {
      message: `Il faut ${SEUIL_TEST} % (${Math.ceil((SEUIL_TEST * NB_QUESTIONS) / 100)} sur ${NB_QUESTIONS}) pour obtenir la ${ceinture}.`,
      actions: [
        { libelle: 'Recommencer avec de nouvelles questions', fn: () => void lancerTest(rang) },
        ...(precedent >= 0 ? [{ libelle: `Essayer le niveau ${NIVEAUX_TEST[precedent].nom}`, fn: () => void lancerTest(precedent) }] : []),
        retour,
      ],
    }
  })

  /** Fermer le bilan : la carte du parcours ; le test revient à ses niveaux */
  function quitterSeance() {
    aller(estTest(seance?.parcours) ? 'test' : estRevision(seance?.parcours) ? 'revisions' : 'parcours')
  }
  /** Quitter une séance en cours (« Reprendre plus tard ») : l'accueil (Nathan, après la première séance en classe) */
  function quitterVersAccueil() {
    if (estTest(seance?.parcours) || estRevision(seance?.parcours)) return quitterSeance()
    aller('accueil')
  }

  // ---------- Révisions espacées (sur l'appareil, d'après les passages terminés) ----------
  let revisions: Revisions = $state(revisionsVides())
  let issuesRevision: Record<number, { reussi: boolean; quand: string }> | null = $state(null)
  // Barrettes gagnées par la séance qui vient de finir (bilan) : ceintures obtenues dont les exercices
  // ont été réussis de nouveau après plusieurs jours. Par chapitre et par ceinture, comme dans le Suivi.
  let barrettesGagnees: { nom: string; couleur: string; theme: string; barrettes: number }[] = $state([])
  function gainsDeBarrettes(avant: Revisions, apres: Revisions) {
    const gains = new Map<string, { nom: string; couleur: string; theme: string; barrettes: number }>()
    for (const p of parcoursSuivis) {
      if (p.style !== 'ceintures' || paliersDe(p).length < 2) continue
      const obtenues = ceinturesObtenues(p, historiques[p.id] ?? [])
      paliersDe(p).forEach((x, k) => {
        if (!obtenues[k]?.obtenue) return
        const etapes = x.etapes.map((i) => p.etapes[i])
        const n = barrettes(apres, etapes)
        if (n <= barrettes(avant, etapes)) return
        const cle = `${p.niveau}|${p.theme}|${obtenues[k].nom}`
        if (n > (gains.get(cle)?.barrettes ?? 0)) gains.set(cle, { nom: obtenues[k].nom, couleur: obtenues[k].couleur, theme: p.theme, barrettes: n })
      })
    }
    return [...gains.values()]
  }
  async function chargerRevisions() {
    const avant = (await stockage!.lire<Revisions>('revisions')) ?? revisionsVides()
    const cles = (await stockage!.cles()).filter((c) => c.startsWith('historique:'))
    const passages = (await Promise.all(cles.map((c) => stockage!.lire<TSeance[]>(c)))).flatMap((h) => h ?? [])
    revisions = integrerPassages(avant, passages, estTest)
    if (revisions !== avant) await stockage!.ecrire('revisions', $state.snapshot(revisions))
    seances[ID_REVISIONS] = await lireSeance(stockage!, ID_REVISIONS)
    historiques[ID_REVISIONS] = await lireHistorique(stockage!, ID_REVISIONS)
  }
  const revisionEnCours = $derived(!!seances[ID_REVISIONS] && !seances[ID_REVISIONS]!.fin)
  const resumeRevisions = $derived(
    Object.keys(revisions.elements).length ? { dus: aRevoir(revisions).length, prochaine: prochaineRevision(revisions), enCours: revisionEnCours } : null,
  )
  // ---------- Accueil : une seule action proposée ----------
  // Reprendre la séance commencée ; sinon la révision du jour ; sinon la
  // ceinture (ou le palier) suivante du parcours travaillé en dernier.
  const actionProposee = $derived.by((): { libelle: string; detail: string; fn: () => void } | null => {
    if (!moteur) return null
    const visibles = tous.filter((p) => !caches.includes(p.id))
    // 1. Séance commencée, la plus récente
    const commencees = visibles.filter((p) => resumes[p.id]?.enCours).sort((a, b) => (seances[b.id]?.debut ?? '').localeCompare(seances[a.id]?.debut ?? ''))
    if (revisionEnCours) return { libelle: 'Reprendre la révision', detail: 'Révision commencée', fn: lancerRevision }
    if (commencees.length) {
      const p = commencees[0]
      const r = resumes[p.id]
      return { libelle: 'Reprendre', detail: `${p.titre} · question ${Math.min(r.fait + 1, r.sur)} sur ${r.sur}`, fn: () => commencer(p) }
    }
    // 2. Révision du jour, à la taille choisie (jamais un stock)
    const dus = aRevoir(revisions).length
    if (dus > 0) {
      const n = Math.min(dus, revisions.taille ?? TAILLE_PAR_DEFAUT)
      return { libelle: 'Réviser maintenant', detail: `Révision du jour · ${n} question${n > 1 ? 's' : ''}`, fn: lancerRevision }
    }
    // 3. Ceinture ou palier suivant, ouvert et pas encore réussi, du parcours travaillé en dernier
    const dernierPassage = (p: Parcours) => (historiques[p.id] ?? []).at(-1)?.fin ?? ''
    const entames = visibles.filter((p) => paliersDe(p).length > 1 && dernierPassage(p)).sort((a, b) => dernierPassage(b).localeCompare(dernierPassage(a)))
    for (const p of entames) {
      const acquis = acquisDe(p, historiques[p.id] ?? [])
      const etats = etatsPaliers(p, resultats[p.id] ?? {}, heure.maintenant, Date.now(), acquis)
      const k = etats.findIndex((x, i) => x.ouvert && !acquis[i])
      if (k === -1) continue
      const nom = nomPalier(p, k).toLowerCase()
      return { libelle: p.style === 'ceintures' ? `Passer la ${nom}` : `Faire le ${nom}`, detail: [p.titre, etats[k].titre.trim()].filter(Boolean).join(' · '), fn: () => commencer(p, etats[k].etapes) }
    }
    return null
  })

  /** Reprend la séance commencée, sinon en tire une nouvelle (exercices à revoir aujourd'hui) */
  function lancerRevision() {
    const commencee = seances[ID_REVISIONS]
    if (commencee && !commencee.fin) {
      actif = commencee.contenu
      void lancer(commencee)
      return
    }
    const p = tirerRevision(revisions)
    if (!p || !moteur) return
    actif = p
    void lancer(nouvelleSeance(p, moteur.VERSION_MOTEUR, 'complet'))
  }
  async function choisirTaille(n: number) {
    revisions = { ...revisions, taille: n }
    await stockage!.ecrire('revisions', $state.snapshot(revisions))
  }
  async function choisirChapitres(c: string[] | undefined) {
    revisions = { ...revisions, chapitres: c }
    await stockage!.ecrire('revisions', $state.snapshot(revisions))
  }

  // ---------- Élève ----------

  async function sauverSeance(s: TSeance) {
    seance = s
    seances[s.parcours] = s
    await ecrireSeance(stockage!, s)
  }

  function ouvrir(p: Parcours) {
    actif = p
    aller('parcours')
  }

  async function lancer(s: TSeance) {
    if (!moteur) return
    await sauverSeance(s)
    aller('seance')
  }

  /** Tout le parcours, ou un palier ; une tentative en cours de ces exercices reprend là où elle en était */
  function commencer(p: Parcours, etapes?: number[]) {
    actif = p
    // Parcours de l'Explorer : commencé, il rejoint Mes parcours
    if (catalogue?.some((c) => c.id === p.id) && !dansSources(p.id) && !ajoutes.some((a) => a.id === p.id)) void basculerAjout(p)
    const existante = seances[p.id]
    const memes = !etapes || (existante && existante.etapes.join() === etapes.join())
    if (existante && !existante.fin && memes) return void lancer(existante)
    // Palier fermé (seuil pas atteint, date d'ouverture pas arrivée) : rien ne se lance
    const palier = etapes && etatsPaliers(p, resultats[p.id] ?? {}, heure.maintenant, Date.now(), acquisDe(p, historiques[p.id] ?? [])).find((x) => x.etapes.join() === etapes.join())
    if (palier && !palier.ouvert) return
    const nouvelle = () => void lancer(nouvelleSeance(p, moteur!.VERSION_MOTEUR, 'complet', etapes))
    // Fiche de cours à lire d'abord, la première fois seulement
    const f = ficheDe(p, etapes)
    if (f?.fiche.avant && !fichesVues.includes(f.cle)) {
      fichesVues = [...fichesVues, f.cle]
      void stockage!.ecrire('fiches-vues', $state.snapshot(fichesVues))
      return ouvrirCours(f.fiche, nouvelle)
    }
    nouvelle()
  }

  // Refaire : les mêmes exercices que la dernière tentative (un palier, ou tout le parcours)
  const refaire = () => void lancer(nouvelleSeance(actif!, moteur!.VERSION_MOTEUR, 'complet', seances[actif!.id]?.etapes))
  /** Bilan d'une séance de palier : nom, pause, et palier suivant avec son état d'après les nouveaux résultats */
  const palierDuBilan = $derived.by(() => {
    if (!seance || !actif || seance.contenu.id !== actif.id) return null
    const etats = etatsPaliers(actif, resultats[actif.id] ?? {}, heure.maintenant, Date.now(), acquisDe(actif, historiques[actif.id] ?? []))
    if (etats.length < 2) return null
    const k = etats.findIndex((x) => x.etapes.join() === seance!.etapes.join())
    if (k === -1) return null
    const suivant = etats[k + 1]
    // Ceinture ou palier déjà réussi lors d'un autre passage que celui-ci
    const autres = (historiques[actif.id] ?? []).filter((s) => s.debut !== seance!.debut)
    return {
      nom: nomPalier(actif, k),
      couleur: actif.style === 'ceintures' ? couleurCeinture(actif, k) : null,
      attendu: etats[k].attendu,
      deja: ceinturesObtenues(actif, autres)[k]?.obtenue === true,
      pause: etats[k].pause,
      ressource: etats[k].ressource,
      fiche: etats[k].fiche,
      suite: suivant
        ? {
            nom: nomPalier(actif, k + 1),
            ouvert: suivant.ouvert,
            libre: suivant.acces !== 'seuil',
            etapes: suivant.etapes,
            condition: conditionPalier(suivant, etats[k]),
            // Réussite suffisante : seule la date d'ouverture manque
            attendDate: suivant.avantOuverture && (suivant.acces !== 'seuil' || (etats[k].fini && etats[k].pourcentage >= suivant.seuil)),
          }
        : null,
    }
  })

  // QR code scanné depuis l'accueil : une session partagée (créée par un
  // camarade ou par l'enseignant) ou une classe (lien du dossier partagé)
  let scanSession = $state(false)
  let invitationAncienne: { inv: InvitationSession; p: Parcours } | null = $state(null)
  async function lireInvitation(texte: string): Promise<'nouveau' | 'autre' | { erreur: string }> {
    const cl = decoderClasse(texte)
    const lienSeul = /^https?:\/\/\S+$/.test(texte.trim()) ? separerClasse(texte) : null
    if (cl || lienSeul) {
      const r = cl ? await rejoindreClasse(cl.l, cl.c) : await rejoindreClasse(lienSeul!.lien, lienSeul!.classe)
      if (r === 'nouveau') scanSession = false
      return r
    }
    const inv = decoderInvitation(texte)
    if (!inv) return 'autre'
    const p = await parcoursDeSession(inv)
    if ('erreur' in p) return p
    if (inv.e && !inv.e.every((k) => k < p.etapes.length)) return { erreur: 'Ce QR code de session est abîmé : demande-le à nouveau.' }
    scanSession = false
    if (moteurPlusAncien(moteur!.VERSION_MOTEUR, inv.m)) invitationAncienne = { inv, p }
    else await rejoindreSession(inv, p)
    return 'nouveau'
  }

  /**
   * Parcours d'une session, à sa version : classes suivies (tout le fichier de
   * chaque dossier), accueil, Explorer. Introuvable : le dossier du QR code est
   * ajouté s'il ne l'est pas, puis dossiers et Explorer sont relus.
   */
  async function parcoursDeSession(inv: InvitationSession): Promise<Parcours | { erreur: string }> {
    const connus = () => [...tous, ...classes.flatMap((c) => (c.fichier ?? []).flatMap((f) => f.parcours)), ...(catalogue ?? [])]
    const trouve = () => connus().find((x) => x.id === inv.p && x.version === inv.v)
    if (trouve()) return trouve()!
    if (inv.l) {
      const { lien, classe } = separerClasse(inv.l)
      // Dossier déjà suivi : l'élève garde sa classe
      if (!classes.some((c) => c.lien === lien)) {
        const r = await rejoindreClasse(lien, classe)
        if (r !== 'nouveau') return r
      }
    }
    await Promise.all([classes.length ? synchroniserClasses() : null, synchroniserExplorer()])
    if (trouve()) return trouve()!
    const autre = connus().find((x) => x.id === inv.p)
    if (autre)
      return {
        erreur: `« ${autre.titre} » n’est pas à la même version que dans la session (${autre.version} sur ton appareil, ${inv.v} dans la session). Vérifie ta connexion, puis demande une nouvelle session.`,
      }
    return { erreur: 'Ce parcours n’est pas sur ton appareil : ajoute d’abord la classe de ton enseignant, puis scanne à nouveau.' }
  }

  async function rejoindreSession(inv: InvitationSession, p: Parcours) {
    invitationAncienne = null
    // Ajouté à l'accueil s'il n'y est pas : l'élève y retrouve son bilan
    if (!dansSources(p.id) && !estTest(p.id)) {
      const deja = ajoutes.find((a) => a.id === p.id)
      if (!deja || deja.version < p.version) {
        ajoutes = [...ajoutes.filter((a) => a.id !== p.id), p]
        await stockage!.ecrire('ajoutes', $state.snapshot(ajoutes))
      }
    }
    await chargerParcours(p)
    actif = p
    await lancer(nouvelleSeance(p, moteur!.VERSION_MOTEUR, 'complet', inv.e, inv.c))
  }

  /** Lien du dossier d'un parcours de classe, avec la classe : porté par le QR code de session */
  /** Provenance écrite dans un signalement : dossier de la classe, ou Explorer */
  function sourceDuParcours(id: string): string {
    const c = classes.find((x) => x.parcours.some((p) => p.id === id))
    if (c) return `dossier ${c.lien}${c.nom ? ` (classe ${c.nom})` : ''}`
    return catalogue?.some((p) => p.id === id) ? 'Explorer de l’équipe MathALÉA' : 'appareil de l’élève'
  }

  function lienDuParcours(id: string): string | undefined {
    const c = classes.find((x) => x.nom && x.parcours.some((p) => p.id === id))
    return c && /^https?:\/\//.test(c.lien) ? lienDeClasse(c.lien, c.nom) : undefined
  }

  // Avec des paliers : la session porte sur un palier ouvert, choisi au lancement
  const session = (code: string, etapes?: number[]) => void lancer(nouvelleSeance(actif!, moteur!.VERSION_MOTEUR, 'complet', etapes, code))

  function ameliorer() {
    const etapes = etapesAAmeliorer(actif!, resultats[actif!.id] ?? {})
    if (etapes.length) void lancer(nouvelleSeance(actif!, moteur!.VERSION_MOTEUR, 'ciblee', etapes))
  }

  async function terminer() {
    const s = seance!
    const r = await terminerSeance(stockage!, s)
    // Résultats de la version courante seulement
    if (s.contenu.version === actif?.version) resultats[s.parcours] = r
    seances[s.parcours] = s
    historiques[s.parcours] = await lireHistorique(stockage!, s.parcours)
    if (estTest(s.parcours)) await noterTest(s)
    // Révisions : une séance de révision fait avancer ou reculer ses exercices ;
    // un autre passage terminé fait entrer les siens
    const revisionsAvant = revisions
    if (estRevision(s.parcours)) {
      const { revisions: suite, issues } = resultatsRevision(revisions, s)
      revisions = suite
      issuesRevision = Object.fromEntries(Object.entries(issues).map(([k, v]) => [k, { reussi: v.reussi, quand: quandRevision(v.apres.prochaine) }]))
    } else revisions = integrerPassages(revisions, [s], estTest)
    barrettesGagnees = gainsDeBarrettes(revisionsAvant, revisions)
    await stockage!.ecrire('revisions', $state.snapshot(revisions))
    // Pourcentage du parcours : seulement pour un passage sur tous ses exercices (pas un palier seul)
    if (s.type === 'complet' && s.etapes.length === s.contenu.etapes.length) {
      derniersComplets[s.parcours] = bilan(s).pourcentage
      await stockage!.ecrire(`complet:${s.parcours}`, derniersComplets[s.parcours])
    }
    aller('bilan')
  }

  async function supprimerTentative(id: string) {
    await supprimerSeance(stockage!, id)
    seances[id] = null
    if (seance?.parcours === id) seance = undefined
    // Un test n'a pas de fiche de parcours : retour à ses niveaux
    aller(estTest(id) ? 'test' : 'parcours')
  }

  function revenirAuxPassees() {
    const s = seance!
    const passees = bilan(s).passees
    s.fin = undefined
    // Première question passée dans l'ordre d'affichage (mélangé ou non)
    s.position = questionsOrdonnees(s).findIndex((q) => passees.some((p) => p.etape === q.etape && p.question === q.question))
    void lancer(s)
  }

  async function basculerCache(p: Parcours) {
    caches = caches.includes(p.id) ? caches.filter((id) => id !== p.id) : [...caches, p.id]
    await stockage!.ecrire('caches', caches)
  }

  async function basculerEpingle(p: Parcours) {
    epingles = epingles.includes(p.id) ? epingles.filter((id) => id !== p.id) : [...epingles, p.id]
    await stockage!.ecrire('epingles', epingles)
  }

  async function ajouterClasse(saisi: string): Promise<string | null> {
    // Lien avec « classe=… » : la classe est choisie d'office
    const { lien, classe } = separerClasse(saisi)
    if (classe) {
      const r = await rejoindreClasse(lien, classe)
      if (r !== 'nouveau') return r.erreur
      return null
    }
    if (classes.some((c) => c.lien === lien)) return 'Cette classe est déjà ajoutée.'
    const c = await synchroniserClasse({ lien, nom: '', disponibles: [], parcours: [] })
    if (c.erreur) return c.erreur
    classes = [...classes, c]
    await ecrireClasses(stockage!, classes)
    for (const p of c.parcours) await chargerParcours(p)
    return null
  }

  async function synchroniserClasses() {
    const avant = $state.snapshot(classes) as Classe[]
    const recues = await Promise.all(avant.map((c) => synchroniserClasse(c)))
    // Une classe ajoutée, choisie ou retirée pendant le téléchargement garde son état
    classes = classes.map((c) => {
      const i = avant.findIndex((a) => a.lien === c.lien && a.nom === c.nom)
      return i < 0 ? c : recues[i]
    })
    await ecrireClasses(stockage!, classes)
    for (const c of classes) for (const p of c.parcours) await chargerParcours(p)
  }

  // Lien ou QR code de classe : le dossier de l'enseignant, avec la classe déjà
  // choisie ; sans classe (tout le dossier), l'élève garde la sienne ou la choisit ensuite
  async function rejoindreClasse(lien: string, nom: string): Promise<'nouveau' | { erreur: string }> {
    const deja = classes.find((c) => c.lien === lien)
    const c = await synchroniserClasse({ ...(deja ? ($state.snapshot(deja) as Classe) : { lien, nom: '', disponibles: [], parcours: [] }), ...(nom ? { nom } : {}) })
    if (c.erreur) return { erreur: c.erreur }
    if (nom && !memeClasse(c.nom, nom)) return { erreur: `La classe ${nom} n’est pas encore sur le drive de l’enseignant.` }
    classes = deja ? classes.map((x) => (x.lien === lien ? c : x)) : [...classes, c]
    await ecrireClasses(stockage!, classes)
    for (const p of c.parcours) await chargerParcours(p)
    return 'nouveau'
  }

  async function choisirClasse(lien: string, nom: string) {
    const c = classes.find((x) => x.lien === lien)
    if (!c) return
    const maj = await synchroniserClasse({ ...($state.snapshot(c) as Classe), nom, parcours: [] })
    classes = classes.map((x) => (x.lien === lien ? maj : x))
    await ecrireClasses(stockage!, classes)
    for (const p of maj.parcours) await chargerParcours(p)
  }

  async function sauvegarder() {
    const nom = `sauvegarde-mathalea-${new Date().toISOString().slice(0, 10)}.json`
    const fait = await enregistrerFichier(nom, await exporterSauvegarde(stockage!))
    return fait === 'partage' ? 'Sauvegarde envoyée.' : fait ? `${nom} enregistré.` : 'Sauvegarde annulée.'
  }

  async function restaurer(texte: string) {
    try {
      await restaurerSauvegarde(stockage!, texte)
      location.reload()
      return ''
    } catch (e) {
      return (e as Error).message
    }
  }

  /** Sauvegarde d'un autre appareil de l'élève, réunie avec celui-ci */
  async function fusionner(texte: string) {
    try {
      await fusionnerSauvegarde(stockage!, texte)
      location.reload()
      return ''
    } catch (e) {
      return (e as Error).message
    }
  }

  /** Annule la dernière restauration : l'état remplacé revient */
  async function annulerRestauration() {
    const copie = await stockage!.lire<string>(CLE_AVANT_RESTAURATION)
    if (!copie) return 'Aucune restauration à annuler.'
    return restaurer(copie)
  }
  let restaurationAnnulable = $state(false)

  async function retirerClasse(lien: string) {
    // Les résultats restent : seuls les parcours téléchargés sont retirés
    classes = classes.filter((c) => c.lien !== lien)
    await ecrireClasses(stockage!, classes)
  }

  /** Bibliothèque d'un enseignant d'avant la 0.6 : le fichier que la page Parcours du site sait ouvrir */
  async function exporterBibliotheque(): Promise<string> {
    const b = await lireBibliotheque(stockage!)
    const objectifs = (await stockage!.lire<Objectif[]>('objectifs')) ?? []
    const nom = nomHorodate('bibliotheque-mathalea')
    const envoi = await enregistrerFichier(nom, exporter(b, objectifs))
    return !envoi ? 'Export annulé.' : envoi === 'partage' ? 'Bibliothèque envoyée.' : `${nom} enregistré.`
  }
</script>

<svelte:head>
  <title>MathALÉA</title>
</svelte:head>

<div class="colonne" aria-busy={travaux > 0}>
  {#if erreurMoteur}
    <p class="p-4 font-bold text-coopmaths-action" role="alert">Moteur MathALÉA indisponible : {erreurMoteur}</p>
  {/if}

  {#key vue}
  <div class="ecran ecran-{sens}">
  {#if !moteur || !pret}
    <!-- rien tant que le moteur (et sa feuille de style) n'est pas chargé -->
  {:else if profil === null}
    <ChoixProfil
      onchoisir={async (pa) => {
        await changerPays(pa)
        profil = 'eleve'
        await stockage!.ecrire('profil', 'eleve')
        accueil()
      }}
      onresumer={resumerSauvegarde}
      onrestaurer={restaurer}
    />
  {:else if vue === 'reglages'}
    <Reglages
      bind:pays={() => pays, (p) => void changerPays(p)}
      {classes}
      onretour={accueil}
      onajouter={ajouterClasse}
      onsynchroniser={synchroniserClasses}
      onretirer={retirerClasse}
      onchoisirClasse={choisirClasse}
      onexporterBibliotheque={bibliothequeExportable ? exporterBibliotheque : null}
      onexporterSauvegarde={sauvegarder}
      onrestaurer={restaurer}
      onresumer={resumerSauvegarde}
      onfusionner={fusionner}
      onapercuFusion={(texte) => apercuFusion(stockage!, texte)}
      onannulerRestauration={restaurationAnnulable ? annulerRestauration : null}
      moteur={moteur ? infoMoteur() : null}
      {miseAJourMoteur}
      onchercherMoteur={moteurMisAJour ? chercherMoteur : null}
    />
  {:else if vue === 'accueil'}
    <Accueil
      {sources}
      {explorer}
      {etatExplorer}
      catalogueRecu={catalogue !== null}
      onrelireExplorer={() => void synchroniserExplorer()}
      bind:niveau={explorerNiveau}
      {ajoutes}
      {aChoisir}
      {organisations}
      {resumes}
      {epingles}
      bind:onglet
      onouvrir={ouvrir}
      oncontinuer={commencer}
      onreglages={() => aller('reglages')}
      onscanner={moteur ? () => (scanSession = true) : undefined}
      revisions={resumeRevisions}
      onrevisions={() => aller('revisions')}
      action={actionProposee}
      ontest={moteur && testPropose ? ouvrirTest : undefined}
      {resumeTest}
      onajouter={ajouterClasse}
      onchoisirClasse={choisirClasse}
      onepingler={basculerEpingle}
      {caches}
      oncacher={basculerCache}
      dejaAjoute={(p) => dansSources(p.id) || ajoutes.some((a) => a.id === p.id)}
      onajouterPlusieurs={ajouterPlusieurs}
      retirable={(p) => !dansSources(p.id) && ajoutes.some((a) => a.id === p.id)}
      onretirerPlusieurs={retirerPlusieurs}
      {sansLien}
      onsansLien={async (v) => {
        sansLien = v
        await stockage!.ecrire('sans-lien', v)
      }}
      onorganiser={async (source, o) => {
        organisations = { ...organisations, [source]: o }
        await stockage!.ecrire('chapitres', $state.snapshot(organisations))
      }}
    >
      {#snippet suivi()}
        <Suivi
          parcours={parcoursSuivis}
          {historiques}
          enCours={seances}
          ceinturesTest={testPropose ? ceinturesTest : []}
          onouvrir={(p) => (estTest(p.id) ? void ouvrirTest() : ouvrir(p))}
          ontest={ouvrirTest}
          {revisions}
          passagesRevision={historiques[ID_REVISIONS] ?? []}
        />
      {/snippet}
      {#snippet fiches()}
        <Fiches
          parcours={tous}
          enregistrees={fichesEnregistrees}
          onenregistrer={async (liste) => {
            fichesEnregistrees = liste
            await stockage!.ecrire(CLE_FICHES, $state.snapshot(liste))
          }}
          onouvrir={(f) => ouvrirCours(f.fiche)}
          bind:ouverts={fichesOuvertes}
          bind:recherche={rechercheFiches}
        />
      {/snippet}
    </Accueil>
  {:else if vue === 'parcours' && actif}
    <DetailParcours
      parcours={actif}
      resultats={resultats[actif.id] ?? {}}
      enCours={resumes[actif.id]?.enCours ?? false}
      etapesEnCours={seances[actif.id] && !seances[actif.id]!.fin ? seances[actif.id]!.etapes : null}
      aAmeliorer={etapesAAmeliorer(actif, resultats[actif.id] ?? {})}
      epingle={dansSources(actif.id) ? epingles.includes(actif.id) : ajoutes.some((a) => a.id === actif!.id)}
      passages={historiques[actif.id] ?? []}
      {revisions}
      explorer={!dansSources(actif.id)}
      onepingler={() => (dansSources(actif!.id) ? basculerEpingle(actif!) : basculerAjout(actif!))}
      onrelire={(s) => {
        relue = s
        aller('relecture')
      }}
      onretour={() => aller('accueil')}
      oncommencer={(etapes) => commencer(actif!, etapes)}
      onrefaire={refaire}
      onameliorer={ameliorer}
      onsession={session}
      onsupprimer={() => supprimerTentative(actif!.id)}
      onfiche={(f) => ouvrirCours(f)}
      lienSession={lienDuParcours(actif.id)}
      versionMoteur={moteur?.VERSION_MOTEUR}
      source={sourceDuParcours(actif.id)}
      oncacher={dansSources(actif.id) && !caches.includes(actif.id)
        ? () => {
            void basculerCache(actif!)
            aller('accueil')
          }
        : undefined}
    />
  {:else if vue === 'revisions'}
    <EcranRevisions {revisions} enCours={revisionEnCours} onlancer={lancerRevision} onchapitres={choisirChapitres} ontaille={choisirTaille} onretour={accueil} />
  {:else if vue === 'test'}
    <TestNiveau
      etat={etatTest}
      disponibles={disponiblesTest}
      enCours={enCoursTest}
      oncommencer={(rang) => void lancerTest(rang)}
      onreprendre={reprendreTest}
      onretour={accueil}
    />
  {:else if vue === 'relecture' && relue}
    <Relecture parcours={relue.contenu} seance={relue} {moteur} onretour={() => aller('parcours')} />
  {:else if vue === 'seance' && seance}
    {#key seance.debut}
      <Seance
        parcours={seance.contenu}
        bind:seance
        {moteur}
        onsauver={sauverSeance}
        bilanDirect={estTest(seance.parcours)}
        onquitter={quitterVersAccueil}
        onterminer={terminer}
        onsupprimer={() => supprimerTentative(seance!.parcours)}
      />
    {/key}
  {:else if vue === 'cours' && cours}
    <Cours fiche={cours.fiche} {formule} onretour={() => aller(cours!.depuis)} oncommencer={cours.ensuite} />
  {:else if vue === 'bilan' && seance && actif}
    <Bilan
      parcours={seance.contenu}
      {seance}
      {moteur}
      nbAAmeliorer={etapesAAmeliorer(actif, resultats[actif.id] ?? {}).length}
      onrefaire={refaire}
      onameliorer={ameliorer}
      onpassees={revenirAuxPassees}
      onfermer={quitterSeance}
      palier={palierDuBilan}
      test={testDuBilan}
      revision={estRevision(seance.parcours) ? (issuesRevision ?? {}) : null}
      barrettes={barrettesGagnees}
      oncontinuer={palierDuBilan?.suite?.ouvert ? () => commencer(actif!, palierDuBilan!.suite!.etapes) : undefined}
      onfiche={(f) => ouvrirCours(f)}
    />
  {/if}
  </div>
  {/key}
  {#if scanSession}
    <Scanner onlu={lireInvitation} onfermer={() => (scanSession = false)} />
  {/if}
  {#if invitationAncienne}
    {@const { inv, p } = invitationAncienne}
    <Feuille onfermer={() => (invitationAncienne = null)}>
      <p role="alert" class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Mets l’application à jour</p>
      <p class="text-sm">Ton application a des exercices plus anciens que ceux de la personne qui a créé la session : certaines questions seront différentes.</p>
      <div class="flex flex-row gap-3">
        <button type="button" class="{boutonInverse} flex-1" style="min-height: 44px" onclick={() => (invitationAncienne = null)}>Annuler</button>
        <button type="button" class="{boutonAction} flex-1" style="min-height: 44px" onclick={() => rejoindreSession(inv, p)}>Continuer quand même</button>
      </div>
    </Feuille>
  {/if}
</div>

<ChoixEnregistrement />
