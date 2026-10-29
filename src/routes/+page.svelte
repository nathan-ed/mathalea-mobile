<script lang="ts">
  import { onMount } from 'svelte'
  import { ficheDe, nomPalier, paliersDe, type Fiche, type Parcours } from '$lib/catalogue'
  import { formuleBrute, type RenduFormule } from '$lib/texteRiche'
  import { CLE_AVANT_RESTAURATION, exporterSauvegarde, restaurerSauvegarde, resumerSauvegarde } from '$lib/sauvegarde'
  import { chargerMoteur, chercherMiseAJourMoteur, infoMoteur, misesAJourMoteur, type Moteur, type Pays } from '$lib/moteur'
  import { dansTauri } from '$lib/stockage'
  import { enregistrerFichier } from '$lib/fichiers'
  import {
    adopter,
    attribuer,
    ajouterClasse as ajouterClasseBibliotheque,
    definirLien,
    parcoursPourClasse,
    preferencesDe,
    publicationPresente,
    reprendre,
    renommerClasse,
    retirerClasse as retirerClasseBibliotheque,
    type Preferences,
    ecrireBibliotheque,
    enregistrer,
    exporter,
    exporterChoix,
    empreinte,
    aJour,
    completerEmpreinte,
    sansEcartDrive,
    deplacer,
    copie,
    CLASSE_SANS_NOM,
    lireBibliotheque,
    parcoursVide,
    supprimer,
    type Bibliotheque,
  } from '$lib/bibliotheque'
  import { rappelExport } from '$lib/rappelExport.svelte'
  import { heure, suivreHeure } from '$lib/heure.svelte'
  import { acquisDe, ceinturesObtenues, completerListe, conditionPalier, etatsPaliers, fusionnerObjectifs, memoriser, objectifsEnCsv, type Objectif } from '$lib/objectifs'
  import { LIEN_DEMONSTRATION, ecrireClasses, lireClasses, lireExplorer, lireFichier, lireFichierDistant, nomHorodate, synchroniserClasse, type Classe } from '$lib/partage'
  import { arborescence, reperesDu, reperesParDefaut, type Repere } from '$lib/explorer'
  import {
    bilan,
    ecrireSeance,
    etapesAAmeliorer,
    lireHistorique,
    lireResultats,
    lireSeance,
    modeQr,
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
  import CreationParcours from '$lib/ui/CreationParcours.svelte'
  import DetailParcours from '$lib/ui/DetailParcours.svelte'
  import EspaceEnseignant from '$lib/ui/EspaceEnseignant.svelte'
  import Reglages, { type Profil } from '$lib/ui/Reglages.svelte'
  import Relecture from '$lib/ui/Relecture.svelte'
  import Releve from '$lib/ui/Releve.svelte'
  import SessionClasse from '$lib/ui/SessionClasse.svelte'
  import FicheParcours from '$lib/ui/FicheParcours.svelte'
  import Scanner from '$lib/ui/Scanner.svelte'
  import EcranRevisions from '$lib/ui/Revisions.svelte'
  import {
    aRevoir,
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
  import { cleReleve, noterSession, type Releve as TReleve } from '$lib/releve'
  import { decoderClasse, decoderInvitation, encoderInvitation, moteurPlusAncien, type InvitationSession } from '$lib/invitation'
  import Seance from '$lib/ui/Seance.svelte'
  import Suivi from '$lib/ui/Suivi.svelte'
  import TestNiveau from '$lib/ui/TestNiveau.svelte'
  import ChoixEnregistrement from '$lib/ui/ChoixEnregistrement.svelte'
  import { NB_QUESTIONS, NIVEAUX_TEST, SEUIL_TEST, ceintureDu, couleurDu, estTest, niveauDuTest, presenterTest, sujetsDu, tirerTest, type EtatTest } from '$lib/testNiveau'
  import type { ExerciceDuReferentiel } from '$lib/moteur'
  import { navigation, retourDeBase } from '$lib/navigation.svelte'

  type Vue = 'accueil' | 'parcours' | 'seance' | 'bilan' | 'reglages' | 'relecture' | 'creation' | 'apercu' | 'test' | 'session' | 'revisions' | 'fiche' | 'cours'

  let stockage: Stockage | undefined
  let pret = $state(false)
  let moteur: Moteur | undefined = $state()
  let erreurMoteur = $state('')
  let profil: Profil | null = $state(null)
  // Prénom que l'élève ajoute à son QR code quand la session le demande (sur l'appareil seulement)
  let prenom = $state('')
  let pays: Pays = $state('FR')
  let vue: Vue = $state('accueil')
  // « creer » (Parcours), « classes » et « classe » (En classe) : seulement avec le
  // réglage Enseignant ; « mes » et « suivi » pour lui seulement en vue élève
  let onglet: 'mes' | 'explorer' | 'suivi' | 'creer' | 'classes' | 'classe' = $state('mes')
  let vueEleve = $state(false)
  let actif: Parcours | undefined = $state()
  // Fiche de cours ouverte, l'écran d'où elle vient et, avant une séance, de quoi la lancer
  let cours: { fiche: Fiche; depuis: Vue; ensuite?: () => void } | null = $state(null)
  let fichesVues: string[] = $state([]) // fiches déjà montrées d'office (« id#palier »)
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
  // Réponses de sessions partagées relevées par l'enseignant (QR codes)
  let releves: TReleve[] = $state([])
  let seances: Record<string, TSeance | null> = $state({})
  let resultats: Record<string, Record<number, ResultatEtape>> = $state({})
  let historiques: Record<string, TSeance[]> = $state({})
  let derniersComplets: Record<string, number | null> = $state({})
  let classes: Classe[] = $state([])
  let epingles: string[] = $state([])
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
  // L'élève choisit sa classe dans un dossier qui en a plusieurs ; l'enseignant les voit toutes
  const aChoisir = $derived(
    profil === 'enseignant' ? [] : classes.filter((c) => !c.nom && c.disponibles.length > 1).map((c) => ({ lien: c.lien, disponibles: c.disponibles })),
  )
  // Enseignant
  let bibliotheque: Bibliotheque = $state({ classes: [], parcours: [] })
  let creation: { parcours: Parcours; cle: number } | null = $state(null)
  // Liste d'objectifs de l'enseignant, objectifs retenus par exercice, derniers choix de création
  let objectifs: Objectif[] = $state([])
  let etiquettes: Record<string, string[]> = $state({})
  let preferences: Partial<Preferences> = $state({})
  let apercu: TSeance | undefined = $state()

  // Aucun parcours intégré : tout vient des dossiers partagés
  const sources: Source[] = $derived(
    profil === 'enseignant'
      ? classes.flatMap((c) =>
          c.fichier
            ? c.fichier.map((f) => ({ id: f.nom === c.nom ? c.lien : `${c.lien}#${f.nom}`, nom: f.nom, parcours: f.parcours }))
            : c.nom
              ? [{ id: c.lien, nom: c.nom, parcours: c.parcours }]
              : [],
        )
      : classes.filter((c) => c.nom).map((c) => ({ id: c.lien, nom: c.nom, parcours: c.parcours })),
  )
  // Parcours d'un dossier suivi : sa classe, et toutes celles du fichier pour l'enseignant
  const parcoursDuDossier = (c: Classe) => [...c.parcours, ...(profil === 'enseignant' ? (c.fichier ?? []).flatMap((f) => f.parcours) : [])]
  // Explorer : catalogue de l'équipe MathALÉA (copie locale) et parcours ajoutés à l'accueil
  let catalogue: Parcours[] | null = $state(null)
  // Degrés et chapitres du référentiel du pays (moteur), pour ranger l'Explorer ; degré et chapitre ouverts
  let reperes: Repere[] | null = $state(null)
  const explorer = $derived(arborescence(catalogue ?? [], pays, reperes ?? reperesParDefaut(pays)))
  let explorerNiveau: string | null = $state(null)
  let explorerChapitre: string | null = $state(null)
  async function lireReperes() {
    const p = pays
    try {
      const r = reperesDu((await moteur?.listerExercices(p)) ?? [])
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
  const dansSources = (id: string) => sources.some((s) => s.parcours.some((p) => p.id === id))
  // Enseignant : parcours éditables venant des dossiers partagés et des parcours de test
  // Toutes les classes des fichiers suivis (l'enseignant voit tout, pas seulement « sa » classe)
  const classesDesDossiers = $derived(classes.flatMap((c) => c.fichier ?? (c.nom ? [{ nom: c.nom, parcours: c.parcours }] : [])))
  const parcoursDesDossiers: Parcours[] = $derived.by(() => {
    const vus = new Map<string, Parcours>()
    for (const c of classesDesDossiers) for (const p of c.parcours) if (!vus.has(p.id) || vus.get(p.id)!.version < p.version) vus.set(p.id, p)
    return [...vus.values()]
  })
  // Repris sans classe puis abandonné : reste proposé
  // Un parcours par identifiant, à sa version la plus récente ; masqué si l'enseignant l'a déjà (même version ou plus récente)
  const modeles: Parcours[] = $derived.by(() => {
    const vus = new Map<string, Parcours>()
    for (const p of [...parcoursDesDossiers, ...importes]) if (!vus.has(p.id) || vus.get(p.id)!.version < p.version) vus.set(p.id, p)
    return [...vus.values()].filter((p) => {
      const local = bibliotheque.parcours.find((pe) => pe.parcours.id === p.id)
      return !local || local.classes.length === 0 || local.parcours.version < p.version
    })
  })
  const classesDuModele = (id: string) => [
    ...new Set([...classesDesDossiers.filter((c) => c.parcours.some((p) => p.id === id)).map((c) => c.nom), ...(classesImportees[id] ?? [])]),
  ]
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

  onMount(async () => {
    stockage = await ouvrirStockage()
    profil = await stockage.lire<Profil>('profil')
    pays = (await stockage.lire<Pays>('pays')) ?? 'FR'
    prenom = (await stockage.lire<string>('prenom')) ?? ''
    classes = await lireClasses(stockage)
    epingles = (await stockage.lire<string[]>('epingles')) ?? []
    fichesVues = (await stockage.lire<string[]>('fiches-vues')) ?? []
    organisations = (await stockage.lire<Record<string, Organisation>>('chapitres')) ?? {}
    catalogue = await stockage.lire<Parcours[]>('explorer')
    // Un test ajouté à l'accueil par une version précédente : il vit dans Teste ton niveau
    ajoutes = ((await stockage.lire<Parcours[]>('ajoutes')) ?? []).filter((p) => !estTest(p.id))
    bibliotheque = await lireBibliotheque(stockage)
    importes = (await stockage.lire<Parcours[]>('importes')) ?? []
    classesImportees = (await stockage.lire<Record<string, string[]>>('importes-classes')) ?? {}
    objectifs = (await stockage.lire<Objectif[]>('objectifs')) ?? []
    releves = (await stockage.lire<TReleve[]>('releves')) ?? []
    const complete = completerEmpreinte(bibliotheque, objectifs)
    if (complete !== bibliotheque) await sauverBibliotheque(complete)
    etiquettes = (await stockage.lire<Record<string, string[]>>('etiquettes')) ?? {}
    preferences = (await stockage.lire<Preferences>('preferences-creation')) ?? {}
    etatTest = (await stockage.lire<EtatTest>('test-niveau')) ?? {}
    for (const e of Object.values(etatTest)) if (e.tirage) e.tirage = presenterTest(e.tirage)
    for (const e of Object.values(etatTest)) if (e.tirage) await chargerParcours(e.tirage)
    for (const p of catalogue ?? []) await chargerParcours(p)
    restaurationAnnulable = !!(await stockage.lire<string>(CLE_AVANT_RESTAURATION))
    for (const p of tous) await chargerParcours(p)
    await chargerRevisions()
    vue = 'accueil'
    // Réglage Enseignant : l'app s'ouvre sur l'onglet Créer
    if (profil === 'enseignant') onglet = 'creer'
    pret = true
    try {
      moteurMisAJour = await misesAJourMoteur()
      moteur = await chargerMoteur()
      moteur.definirLangue(pays === 'CH' ? 'fr-CH' : 'fr-FR')
      void lireReperes()
    } catch (e) {
      erreurMoteur = (e as Error).message
    }
    actualiser()
  })

  // Parcours des dossiers suivis, Explorer et moteur : relus au lancement, à chaque retour
  // dans l'app, au retour de la connexion et toutes les 10 minutes tant qu'elle est affichée
  const ECART_MINIMUM = 60_000
  let actualiseLe = 0
  let actualisation: Promise<unknown> | null = null
  function actualiser() {
    if (!pret || actualisation || Date.now() - actualiseLe < ECART_MINIMUM) return
    actualiseLe = Date.now()
    // Fichier exporté pas encore vu sur le drive : il y est peut-être maintenant
    const aVerifier = profil === 'enseignant' && bibliotheque.lien && bibliotheque.publieLe && !bibliotheque.verifieLe
    actualisation = Promise.all([
      classes.length ? synchroniserClasses() : null,
      synchroniserExplorer(),
      moteur && moteurMisAJour ? chercherMoteur() : null,
      aVerifier ? verifierDossier() : null,
    ]).finally(
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

  /** Nouvelle version du catalogue ; les parcours ajoutés suivent leur nouvelle version */
  async function synchroniserExplorer() {
    try {
      const recu = await lireExplorer()
      catalogue = recu
      await stockage!.ecrire('explorer', recu)
      ajoutes = ajoutes.map((a) => recu.find((p) => p.id === a.id) ?? a)
      await stockage!.ecrire('ajoutes', $state.snapshot(ajoutes))
      for (const p of [...ajoutes, ...recu]) await chargerParcours(p)
    } catch (e) {
      // Hors connexion ou adresse indisponible : la copie locale reste affichée
      console.warn('Explorer', e)
    }
  }

  async function basculerAjout(p: Parcours) {
    if (estTest(p.id)) return
    ajoutes = ajoutes.some((a) => a.id === p.id) ? ajoutes.filter((a) => a.id !== p.id) : [...ajoutes, p]
    await stockage!.ecrire('ajoutes', $state.snapshot(ajoutes))
    await chargerParcours(p)
  }

  async function changerPays(p: Pays) {
    pays = p
    moteur?.definirLangue(p === 'CH' ? 'fr-CH' : 'fr-FR')
    reperes = null
    explorerNiveau = explorerChapitre = null
    void lireReperes()
    await stockage!.ecrire('pays', p)
  }

  async function changerProfil(p: Profil) {
    profil = p
    // Réglage Enseignant coché : l'onglet Créer s'ouvre au retour des réglages
    vueEleve = false
    onglet = p === 'enseignant' ? 'creer' : ['creer', 'classes', 'classe'].includes(onglet) ? 'mes' : onglet
    await stockage!.ecrire('profil', p)
  }

  // Profondeur de chaque écran : un écran plus profond arrive par la droite, un retour par la gauche
  const PROFONDEUR: Record<Vue, number> = { accueil: 0, reglages: 1, parcours: 1, test: 1, creation: 1, session: 1, revisions: 1, fiche: 1, seance: 2, relecture: 2, bilan: 2, apercu: 2, cours: 2 }
  let sens: 'avant' | 'arriere' = $state('avant')
  // L'aperçu garde l'éditeur monté : même écran pour l'animation
  const ecran = $derived.by((): Vue => (vue === ('apercu' as Vue) ? 'creation' : vue))

  function aller(v: Vue) {
    sens = PROFONDEUR[v] < PROFONDEUR[vue] ? 'arriere' : 'avant'
    vue = v
    scrollTo(0, 0)
  }

  const accueil = () => aller('accueil')
  // Sessions de l'enseignant (onglet En classe) et celle ouverte sur sa page
  let sessionOuverte: string | null = $state(null)
  const releveOuvert = $derived(releves.find((r) => r.cle === sessionOuverte) ?? null)
  async function sauverReleves(r: TReleve[]) {
    releves = r
    await stockage!.ecrire('releves', $state.snapshot(r))
  }
  /** Session lancée par l'enseignant : gardée pour la relever plus tard, puis sa page */
  async function lancerSession(p: Parcours, code: string, etapes?: number[], classe?: string) {
    const invitation = moteur ? encoderInvitation({ c: code, p, m: moteur.VERSION_MOTEUR, ...(etapes ? { e: etapes } : {}) }) : undefined
    await sauverReleves(noterSession($state.snapshot(releves) as TReleve[], { code, parcours: p.id, version: p.version, titre: p.titre, invitation, classe }, null))
    ouvrirSession(cleReleve({ c: code, p: p.id, v: p.version }))
  }
  // Page d'où la session a été ouverte : la page d'un parcours, l'onglet Classes, sinon l'onglet En classe
  let sessionDepuis: 'classe' | 'classes' | 'fiche' = 'classe'
  function ouvrirSession(cle: string) {
    sessionDepuis = vue === 'fiche' ? 'fiche' : vue === 'accueil' && onglet === 'classes' ? 'classes' : 'classe'
    sessionOuverte = cle
    aller('session')
  }
  function retourSession() {
    if (sessionDepuis === 'fiche' && ficheOuverte) return aller('fiche')
    if (sessionDepuis === 'classes') {
      vueEleve = false
      onglet = 'classes'
      return aller('accueil')
    }
    versClasse()
  }

  // Page d'un parcours de la bibliothèque (enseignant) ; l'éditeur et l'essai y reviennent
  let ficheId: string | null = $state(null)
  const ficheOuverte = $derived(bibliotheque.parcours.find((pe) => pe.parcours.id === ficheId))
  let creationDepuis: 'creer' | 'fiche' = 'creer'
  function ouvrirFiche(id: string) {
    ficheId = id
    creation = null
    aller('fiche')
  }
  const retourEditeur = () => {
    if (creationDepuis === 'fiche' && ficheOuverte) {
      creation = null
      aller('fiche')
    } else versCreer()
  }
  /** Parcours de l'Explorer repris par l'enseignant : dans sa bibliothèque, puis sa page (choix des classes) */
  async function donnerAuxClasses(p: Parcours) {
    await sauverBibliotheque(adopter($state.snapshot(bibliotheque) as Bibliotheque, $state.snapshot(p) as Parcours))
    ouvrirFiche(p.id)
  }
  // Parcours qu'on peut lancer en session : bibliothèque et dossiers suivis, à leur version la plus récente
  const parcoursSession: Parcours[] = $derived.by(() => {
    const vus = new Map<string, Parcours>()
    for (const p of [...bibliotheque.parcours.map((pe) => pe.parcours), ...tous]) if (p.id && (!vus.has(p.id) || vus.get(p.id)!.version < p.version)) vus.set(p.id, p)
    return [...vus.values()]
  })
  const nomsClasses = $derived(bibliotheque.classes.map((c) => c.nom))
  const classesDe = (id: string) => bibliotheque.parcours.find((pe) => pe.parcours.id === id)?.classes ?? []
  // Un onglet de l'enseignant : la vue élève se referme
  function versClasse() {
    vueEleve = false
    onglet = 'classe'
    aller('accueil')
  }
  // Espace enseignant : onglet « Créer » de l'accueil
  function versCreer() {
    creation = null
    vueEleve = false
    onglet = 'creer'
    aller('accueil')
  }
  navigation.versAccueil = () => {
    // Aperçu : retour à l'éditeur, qui protège lui-même le brouillon
    if (vue === 'apercu') return aller('creation')
    creation = null
    onglet = profil === 'enseignant' && !vueEleve ? 'creer' : 'mes'
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
      creation: retourEditeur,
      apercu: () => aller(apercuDepuis),
      session: retourSession,
      fiche: versCreer,
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

  async function ouvrirTest() {
    aller('test')
    if (!referentielCan && moteur) {
      // Sujets : référentiel français quel que soit le pays (la CAN n'existe que là)
      referentielCan = (await moteur.listerExercices('FR')).filter((e) => e.niveau === 'CAN')
    }
  }

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

  /** Quitter une séance ou son bilan : le test revient à ses niveaux */
  function quitterSeance() {
    aller(estTest(seance?.parcours) ? 'test' : estRevision(seance?.parcours) ? 'revisions' : 'parcours')
  }

  // ---------- Révisions espacées (sur l'appareil, d'après les passages terminés) ----------
  let revisions: Revisions = $state(revisionsVides())
  let issuesRevision: Record<number, { reussi: boolean; quand: string }> | null = $state(null)
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
    return {
      nom: nomPalier(actif, k),
      pause: etats[k].pause,
      ressource: etats[k].ressource,
      fiche: etats[k].fiche,
      suite: suivant
        ? {
            nom: nomPalier(actif, k + 1),
            ouvert: suivant.ouvert,
            etapes: suivant.etapes,
            condition: conditionPalier(suivant, etats[k]),
            // Réussite suffisante : seule la date d'ouverture manque
            attendDate: suivant.avantOuverture && (suivant.acces !== 'seuil' || (etats[k].fini && etats[k].pourcentage >= suivant.seuil)),
          }
        : null,
    }
  })

  // QR code de session affiché par l'enseignant : l'élève arrive directement
  // dans la session, sur la copie du parcours portée par le QR code
  let scanSession = $state(false)
  let invitationAncienne: InvitationSession | null = $state(null)
  async function lireInvitation(texte: string): Promise<'nouveau' | 'autre' | { erreur: string }> {
    const cl = decoderClasse(texte)
    if (cl) return rejoindreClasse(cl.l, cl.c)
    const inv = decoderInvitation(texte)
    if (!inv) return 'autre'
    scanSession = false
    if (moteurPlusAncien(moteur!.VERSION_MOTEUR, inv.m)) invitationAncienne = inv
    else await rejoindreSession(inv)
    return 'nouveau'
  }
  async function rejoindreSession(inv: InvitationSession) {
    invitationAncienne = null
    const p = tous.find((x) => x.id === inv.p.id && x.version === inv.p.version) ?? inv.p
    // Ajouté à l'accueil s'il n'y est pas : l'élève y retrouve son bilan et son QR code
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
    if (estRevision(s.parcours)) {
      const { revisions: suite, issues } = resultatsRevision(revisions, s)
      revisions = suite
      issuesRevision = Object.fromEntries(Object.entries(issues).map(([k, v]) => [k, { reussi: v.reussi, quand: quandRevision(v.apres.prochaine) }]))
    } else revisions = integrerPassages(revisions, [s], estTest)
    await stockage!.ecrire('revisions', $state.snapshot(revisions))
    // Pourcentage du parcours : seulement pour un passage sur tous ses exercices (pas un palier seul)
    if (s.type === 'complet' && s.etapes.length === s.contenu.etapes.length) {
      derniersComplets[s.parcours] = bilan(s).pourcentage
      await stockage!.ecrire(`complet:${s.parcours}`, derniersComplets[s.parcours])
    }
    aller('bilan')
  }

  async function changerPrenom(p: string) {
    prenom = p
    await stockage!.ecrire('prenom', p)
  }

  /** Session « QR code avant la correction » : QR code montré, les résultats se voient */
  async function marquerQrMontre(s: TSeance) {
    s.qrMontre = true
    const enCours = await lireSeance(stockage!, s.parcours)
    if (enCours?.debut === s.debut) await ecrireSeance(stockage!, { ...enCours, qrMontre: true })
    const h = (await lireHistorique(stockage!, s.parcours)).map((x) => (x.debut === s.debut ? { ...x, qrMontre: true } : x))
    await stockage!.ecrire(`historique:${s.parcours}`, h)
    historiques[s.parcours] = h
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

  async function basculerEpingle(p: Parcours) {
    epingles = epingles.includes(p.id) ? epingles.filter((id) => id !== p.id) : [...epingles, p.id]
    await stockage!.ecrire('epingles', epingles)
  }

  async function ajouterClasse(lien: string): Promise<string | null> {
    if (classes.some((c) => c.lien === lien)) return 'Cette classe est déjà ajoutée.'
    const c = await synchroniserClasse({ lien, nom: '', disponibles: [], parcours: [] })
    if (c.erreur) return c.erreur
    classes = [...classes, c]
    await ecrireClasses(stockage!, classes)
    for (const p of parcoursDuDossier(c)) await chargerParcours(p)
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
    for (const c of classes) for (const p of parcoursDuDossier(c)) await chargerParcours(p)
  }

  // QR code de l'enseignant : son dossier, avec la classe déjà choisie ; sans
  // classe (tout le dossier), l'élève garde la sienne ou la choisit ensuite
  async function rejoindreClasse(lien: string, nom: string): Promise<'nouveau' | { erreur: string }> {
    const deja = classes.find((c) => c.lien === lien)
    const c = await synchroniserClasse({ ...(deja ? ($state.snapshot(deja) as Classe) : { lien, nom: '', disponibles: [], parcours: [] }), ...(nom ? { nom } : {}) })
    if (c.erreur) return { erreur: c.erreur }
    if (nom && c.nom !== nom) return { erreur: `La classe ${nom} n’est pas encore sur le drive de l’enseignant.` }
    classes = deja ? classes.map((x) => (x.lien === lien ? c : x)) : [...classes, c]
    await ecrireClasses(stockage!, classes)
    for (const p of parcoursDuDossier(c)) await chargerParcours(p)
    scanSession = false
    return 'nouveau'
  }

  async function choisirClasse(lien: string, nom: string) {
    const c = classes.find((x) => x.lien === lien)
    if (!c) return
    const maj = await synchroniserClasse({ ...($state.snapshot(c) as Classe), nom, parcours: [] })
    classes = classes.map((x) => (x.lien === lien ? maj : x))
    await ecrireClasses(stockage!, classes)
    for (const p of parcoursDuDossier(maj)) await chargerParcours(p)
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

  // ---------- Enseignant ----------

  async function sauverBibliotheque(b: Bibliotheque) {
    bibliotheque = b
    await ecrireBibliotheque(stockage!, $state.snapshot(b) as Bibliotheque)
  }

  function creer(p: Parcours = parcoursVide(preferences), depuis: 'creer' | 'fiche' = 'creer') {
    creationDepuis = depuis
    creation = { parcours: p, cle: Date.now() }
    aller('creation')
  }

  async function sauverObjectifs(liste: Objectif[]) {
    objectifs = liste
    await stockage!.ecrire('objectifs', $state.snapshot(liste))
  }

  async function exporterListeObjectifs() {
    const nom = nomHorodate('objectifs-mathalea').replace(/\.json$/, '.csv')
    return (await enregistrerFichier(nom, objectifsEnCsv($state.snapshot(objectifs) as Objectif[]))) ? `${nom} enregistré.` : 'Export annulé.'
  }

  async function sauverPreferences(pref: Preferences) {
    preferences = pref
    await stockage!.ecrire('preferences-creation', pref)
  }

  // Parcours qui vient d'être enregistré : l'espace enseignant propose de le télécharger
  let dernier: string | null = $state(null)

  async function valider(p: Parcours, nouveaux: Objectif[]) {
    // On crée pour un niveau : un parcours existant garde ses classes, un nouveau n'en a pas encore
    const classesParcours = bibliotheque.parcours.find((pe) => pe.parcours.id === p.id)?.classes ?? []
    const b = enregistrer($state.snapshot(bibliotheque) as Bibliotheque, [...classesParcours], p)
    await sauverBibliotheque(b)
    await sauverPreferences(preferencesDe(p))
    etiquettes = memoriser($state.snapshot(etiquettes), p.etapes)
    await stockage!.ecrire('etiquettes', $state.snapshot(etiquettes))
    if (nouveaux.length) await sauverObjectifs(fusionnerObjectifs($state.snapshot(objectifs) as Objectif[], nouveaux))
    // Modification depuis la page du parcours : retour à cette page (l'état de
    // publication y est, et la bannière propose de mettre le drive à jour)
    if (creationDepuis === 'fiche' && p.id) return ouvrirFiche(p.id)
    // Création : l'identifiant est attribué par enregistrer(), c'est le dernier ajouté
    dernier = p.id || b.parcours.at(-1)!.parcours.id
    versCreer()
  }

  async function exporterParcoursChoisis(ids: string[]) {
    const f = exporterChoix($state.snapshot(bibliotheque) as Bibliotheque, ids)
    if (!f) return ''
    const envoi = await enregistrerFichier(f.nom, f.texte)
    if (!envoi) return 'Téléchargement annulé.'
    await sauverBibliotheque(f.bibliotheque)
    return envoi === 'partage' ? 'Fichier envoyé.' : 'Fichier exporté.'
  }

  // Parcours importés d'un fichier (collègue) : proposés dans « Éditer un parcours existant »
  let importes: Parcours[] = $state([])
  // Classes de chaque parcours importé : reprises quand l'enseignant l'édite
  let classesImportees: Record<string, string[]> = $state({})
  async function importerFichier(texte: string): Promise<{ message: string; parcours: Parcours[] }> {
    try {
      const f = lireFichier(texte)
      const recus = f.classes.flatMap((c) => c.parcours)
      const classes = { ...classesImportees }
      for (const c of f.classes) {
        if (c.nom === CLASSE_SANS_NOM) continue
        for (const p of c.parcours) classes[p.id] = [...new Set([...(classes[p.id] ?? []), c.nom])]
      }
      classesImportees = classes
      await stockage!.ecrire('importes-classes', classes)
      const vus = new Map(importes.map((p) => [p.id, p]))
      let nouveaux = 0
      for (const p of recus) {
        const avant = vus.get(p.id)
        if (!avant) nouveaux++
        if (!avant || avant.version < p.version) vus.set(p.id, p)
      }
      importes = [...vus.values()]
      await stockage!.ecrire('importes', $state.snapshot(importes))
      return {
        message: `${recus.length} parcours importé${recus.length > 1 ? 's' : ''}${nouveaux < recus.length ? ' (déjà présents : version la plus récente gardée)' : ''}.`,
        parcours: recus,
      }
    } catch (e) {
      return { message: (e as Error).message, parcours: [] }
    }
  }

  /**
   * Reprend la bibliothèque publiée (lien du dossier partagé ou fichier) :
   * autre appareil, ou modifications faites sur la page du site. Rien n'est effacé.
   */
  async function reprendreBibliotheque(source: { lien?: string; texte?: string }): Promise<string> {
    try {
      const f = source.lien ? await lireFichierDistant(source.lien) : lireFichier(source.texte ?? '')
      let b = reprendre($state.snapshot(bibliotheque) as Bibliotheque, f)
      if (source.lien && !b.lien) b = definirLien(b, source.lien)
      const liste = fusionnerObjectifs($state.snapshot(objectifs) as Objectif[], f.bibliotheque?.objectifs ?? [])
      // Rien de plus ici que dans le fichier complet repris : l'app est à jour avec lui
      const duFichier = empreinte(reprendre({ classes: [], parcours: [] }, f), f.bibliotheque?.objectifs ?? [])
      if (f.banque && duFichier === empreinte(b, liste)) b = { ...b, empreinte: duFichier, publieLe: f.exporteLe }
      await sauverBibliotheque(b)
      if (f.bibliotheque?.objectifs?.length) await sauverObjectifs(liste)
      const ids = new Set([...f.classes.flatMap((c) => c.parcours), ...(f.bibliotheque?.parcours ?? [])].map((p) => p.id))
      const n = f.classes.length
      return `${ids.size} parcours repris${n ? `, ${n} classe${n > 1 ? 's' : ''}` : ''}.`
    } catch (e) {
      return (e as Error).message
    }
  }

  // ---------- Démonstration (Réglages, enseignant) ----------
  // Exception voulue à « aucun parcours dans l'app » : chargés seulement sur
  // demande de l'enseignant, et retirés d'un geste
  const demonstration = $derived(classes.some((c) => c.lien === LIEN_DEMONSTRATION))

  async function chargerDemonstration(): Promise<string> {
    try {
      const f = lireFichier(await (await fetch('/demo/parcours-demonstration.json')).text())
      const c = f.classes[0]
      classes = [...classes.filter((x) => x.lien !== LIEN_DEMONSTRATION), { lien: LIEN_DEMONSTRATION, nom: c.nom, disponibles: [c.nom], parcours: c.parcours, fichier: f.classes }]
      await ecrireClasses(stockage!, $state.snapshot(classes) as Classe[])
      for (const p of c.parcours) await chargerParcours(p)
      const avant = $state.snapshot(bibliotheque) as Bibliotheque
      const objectifsAvant = $state.snapshot(objectifs) as Objectif[]
      let liste = objectifsAvant
      for (const p of c.parcours) liste = completerListe(liste, p.etapes.flatMap((e) => e.objectifs ?? []), p.niveau, p.theme)
      // Parcours d'essai : ils ne rendent pas le drive « différent »
      await sauverBibliotheque(sansEcartDrive(avant, objectifsAvant, reprendre(avant, f), liste))
      await sauverObjectifs(liste)
      return `${c.parcours.length} parcours chargés : classe « ${c.nom} » dans Mes parcours, et votre bibliothèque dans Créer.`
    } catch (e) {
      return `Chargement impossible : ${(e as Error).message}`
    }
  }

  async function retirerDemonstration(): Promise<string> {
    const c = classes.find((x) => x.lien === LIEN_DEMONSTRATION)
    if (!c) return ''
    const ids = new Set(c.parcours.map((p) => p.id))
    classes = classes.filter((x) => x.lien !== LIEN_DEMONSTRATION)
    await ecrireClasses(stockage!, $state.snapshot(classes) as Classe[])
    const b = $state.snapshot(bibliotheque) as Bibliotheque
    const o = $state.snapshot(objectifs) as Objectif[]
    await sauverBibliotheque(sansEcartDrive(b, o, { ...b, classes: b.classes.filter((x) => x.nom !== c.nom), parcours: b.parcours.filter((pe) => !ids.has(pe.parcours.id)) }, o))
    return 'Parcours de démonstration retirés. Vos résultats d’essai restent dans le Suivi.'
  }

  // L'aperçu revient à l'éditeur, ou à la page du parcours (« Essayer »)
  let apercuDepuis: Vue = 'creation'
  function voirApercu(p: Parcours, depuis: Vue = 'creation') {
    apercuDepuis = depuis
    apercu = nouvelleSeance({ ...p, id: p.id || 'apercu' }, moteur!.VERSION_MOTEUR)
    aller('apercu')
  }

  /** Le dossier partagé contient-il le dernier fichier publié ? */
  async function verifierDossier(): Promise<string> {
    if (!bibliotheque.lien) return ''
    try {
      const dossier = await lireFichierDistant(bibliotheque.lien)
      if (!publicationPresente(bibliotheque, dossier)) {
        return 'Le fichier n’est pas encore sur le drive.'
      }
      // La bannière « déposez-le sur le drive » disparaît : rien d'autre à dire
      await sauverBibliotheque({ ...($state.snapshot(bibliotheque) as Bibliotheque), verifieLe: new Date().toISOString() })
      return ''
    } catch (e) {
      return (e as Error).message
    }
  }

  // Rappel sous la barre de chaque écran (hors séance) : l'app a des modifications que le fichier complet n'a pas
  // puis, une fois exporté, tant que le drive n'a pas ce fichier (relu au retour dans l'app)
  // Sans dossier partagé : rappel de le configurer (champ de la mise en route, onglet Créer)
  rappelExport.exporter = () => exporterClasse()
  rappelExport.configurer = () => {
    versCreer()
    setTimeout(() => document.getElementById('lien-dossier')?.focus(), 400)
  }
  $effect(() => {
    rappelExport.etat =
      profil !== 'enseignant' || ['seance', 'test', 'bilan', 'relecture'].includes(vue) || !bibliotheque.parcours.length
        ? null
        : !aJour(bibliotheque, objectifs)
          ? 'differente'
          : !bibliotheque.lien
            ? 'configurer'
            : bibliotheque.publieLe && !bibliotheque.verifieLe
              ? 'deposer'
              : null
  })

  async function exporterClasse() {
    const { texte, bibliotheque: b } = exporter($state.snapshot(bibliotheque) as Bibliotheque, $state.snapshot(objectifs) as Objectif[])
    const nom = nomHorodate('parcours-mathalea')
    const envoi = await enregistrerFichier(nom, texte)
    if (!envoi) return 'Export annulé.'
    await sauverBibliotheque(b)
    return envoi === 'partage' ? 'Déposez le fichier sur le drive.' : 'Fichier exporté : déposez-le sur le drive.'
  }

</script>

<svelte:head>
  <title>MathALÉA</title>
</svelte:head>

{#snippet espace(section: 'parcours' | 'classes')}
      <EspaceEnseignant
        {section}
        sessions={releves}
        onsession={ouvrirSession}
        onclasses={() => {
          onglet = 'classes'
          scrollTo(0, 0)
        }}
        onvueEleve={() => {
          vueEleve = true
          onglet = 'mes'
          aller('accueil')
        }}
        {bibliotheque}
        modeles={modeles}
        {objectifs}
        {pays}
        onouvrir={(pe) => ouvrirFiche(pe.parcours.id)}
        oncreer={() => creer()}
        {dernier}
        onfermerDernier={() => (dernier = null)}
        onexporterChoix={exporterParcoursChoisis}
        onimporter={importerFichier}
        onreprendre={reprendreBibliotheque}
        onverifier={verifierDossier}
        ondeplacer={(id, classe, sens) => sauverBibliotheque(deplacer($state.snapshot(bibliotheque) as Bibliotheque, id, classe, sens))}
        onediter={async (p) => {
          await sauverBibliotheque(adopter($state.snapshot(bibliotheque) as Bibliotheque, p, classesDuModele(p.id)))
          const pe = bibliotheque.parcours.find((x) => x.parcours.id === p.id)!
          creer(pe.parcours)
        }}
        onparcoursDeClasse={(classe, ids) => sauverBibliotheque(parcoursPourClasse($state.snapshot(bibliotheque) as Bibliotheque, classe, ids))}
        onajouterClasse={(nom) => sauverBibliotheque(ajouterClasseBibliotheque($state.snapshot(bibliotheque) as Bibliotheque, nom))}
        onrenommerClasse={(avant, apres) => sauverBibliotheque(renommerClasse($state.snapshot(bibliotheque) as Bibliotheque, avant, apres))}
        onretirerClasse={(nom) => sauverBibliotheque(retirerClasseBibliotheque($state.snapshot(bibliotheque) as Bibliotheque, nom))}
        onobjectifs={sauverObjectifs}
        onexporterObjectifs={exporterListeObjectifs}
        onlien={(lien) => sauverBibliotheque(definirLien($state.snapshot(bibliotheque) as Bibliotheque, lien))}
        onexporter={exporterClasse}
        onreglages={() => aller('reglages')}
      />
{/snippet}

<div class="colonne">
  {#if erreurMoteur}
    <p class="p-4 font-bold text-coopmaths-action" role="alert">Moteur MathALÉA indisponible : {erreurMoteur}</p>
  {/if}

  {#key ecran}
  <div class="ecran ecran-{sens}">
  {#if !moteur || !pret}
    <!-- rien tant que le moteur (et sa feuille de style) n'est pas chargé -->
  {:else if profil === null}
    <ChoixProfil
      onchoisir={async (pa) => {
        await changerPays(pa)
        await changerProfil('eleve')
        accueil()
      }}
      onresumer={resumerSauvegarde}
      onrestaurer={restaurer}
    />
  {:else if vue === 'reglages'}
    <Reglages
      bind:profil={() => profil!, (p) => void changerProfil(p)}
      bind:pays={() => pays, (p) => void changerPays(p)}
      {classes}
      onretour={accueil}
      onajouter={ajouterClasse}
      onsynchroniser={synchroniserClasses}
      onretirer={retirerClasse}
      onchoisirClasse={choisirClasse}
      onexporterSauvegarde={sauvegarder}
      onrestaurer={restaurer}
      onresumer={resumerSauvegarde}
      onannulerRestauration={restaurationAnnulable ? annulerRestauration : null}
      moteur={moteur ? infoMoteur() : null}
      {miseAJourMoteur}
      onchercherMoteur={moteurMisAJour ? chercherMoteur : null}
      {preferences}
      onpreferences={sauverPreferences}
      {demonstration}
      onchargerDemonstration={chargerDemonstration}
      onretirerDemonstration={retirerDemonstration}
    />
  {:else if vue === 'creation' || vue === 'apercu'}
    {#if creation}
      <!-- Gardé monté pendant l'aperçu : la saisie n'est pas perdue -->
      <div hidden={vue === 'apercu'}>
        {#key creation.cle}
          <CreationParcours
            {bibliotheque}
            chapitresDossiers={classesDesDossiers.flatMap((c) => c.parcours.map((p) => ({ niveau: p.niveau, theme: p.theme })))}
            {objectifs}
            {etiquettes}
            parcours={creation.parcours}
            {moteur}
            {pays}
            onvalider={valider}
            onapercu={voirApercu}
            ondupliquer={creation.parcours.id ? (p) => creer(copie(p)) : undefined}
            onexporter={creation.parcours.id ? () => exporterParcoursChoisis([creation!.parcours.id]) : undefined}
            onsupprimer={creation.parcours.id
              ? async () => {
                  await sauverBibliotheque(supprimer($state.snapshot(bibliotheque) as Bibliotheque, creation!.parcours.id))
                  versCreer()
                }
              : undefined}
            onretour={retourEditeur}
          />
        {/key}
      </div>
    {/if}
    {#if vue === 'apercu' && apercu}
      {#key apercu.debut}
        <Seance parcours={apercu.contenu} bind:seance={apercu} {moteur} onsauver={() => {}} onquitter={() => aller(apercuDepuis)} onterminer={() => aller(apercuDepuis)} />
      {/key}
    {/if}
  {:else if vue === 'accueil'}
    <Accueil
      {sources}
      {explorer}
      bind:niveau={explorerNiveau}
      bind:chapitre={explorerChapitre}
      {ajoutes}
      {aChoisir}
      {organisations}
      {resumes}
      {epingles}
      enseignant={profil === 'enseignant'}
      {vueEleve}
      onquitterVueEleve={() => {
        vueEleve = false
        onglet = 'creer'
        scrollTo(0, 0)
      }}
      bind:onglet
      onouvrir={ouvrir}
      oncontinuer={commencer}
      onreglages={() => aller('reglages')}
      onscanner={moteur ? () => (scanSession = true) : undefined}
      revisions={resumeRevisions}
      onrevisions={() => aller('revisions')}
      ontest={moteur ? ouvrirTest : undefined}
      {resumeTest}
      onajouter={ajouterClasse}
      onchoisirClasse={choisirClasse}
      onepingler={(p) => (dansSources(p.id) ? basculerEpingle(p) : basculerAjout(p))}
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
          {ceinturesTest}
          onouvrir={(p) => (estTest(p.id) ? void ouvrirTest() : ouvrir(p))}
          ontest={ouvrirTest}
          {revisions}
          passagesRevision={historiques[ID_REVISIONS] ?? []}
        />
      {/snippet}
      {#snippet espaceEnseignant()}
        {@render espace('parcours')}
      {/snippet}
      {#snippet classesEnseignant()}
        {@render espace('classes')}
      {/snippet}
      {#snippet enClasse()}
        <Releve
          {releves}
          parcours={parcoursSession}
          classes={nomsClasses}
          {classesDe}
          onsauver={sauverReleves}
          onouvrir={ouvrirSession}
          onlancer={(p, code, etapes, classe) => void lancerSession(p, code, etapes, classe)}
          onreglages={() => aller('reglages')}
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
      onsessionClasse={profil === 'enseignant' ? (code, etapes, classe) => void lancerSession(actif!, code, etapes, classe) : undefined}
      onfiche={(f) => ouvrirCours(f)}
      ondonner={profil === 'enseignant' && !vueEleve && catalogue?.some((c) => c.id === actif!.id) ? () => void donnerAuxClasses(actif!) : undefined}
      classesEnseignant={nomsClasses}
      versionMoteur={moteur?.VERSION_MOTEUR}
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
  {:else if vue === 'session' && releveOuvert}
    <SessionClasse
      releve={releveOuvert}
      {releves}
      {moteur}
      niveau={bibliotheque.parcours.find((pe) => pe.parcours.id === releveOuvert.parcours)?.parcours.niveau ?? ''}
      onsauver={sauverReleves}
      onretour={retourSession}
    />
  {:else if vue === 'fiche' && ficheOuverte}
    {@const pe = ficheOuverte}
    <FicheParcours
      {pe}
      classes={nomsClasses}
      drive={!!bibliotheque.lien}
      sessions={releves.filter((r) => r.parcours === pe.parcours.id).sort((a, b) => b.le.localeCompare(a.le))}
      onretour={versCreer}
      onmodifier={() => creer(pe.parcours, 'fiche')}
      onessayer={() => voirApercu(pe.parcours, 'fiche')}
      onlancer={(code, etapes, classe) => void lancerSession(pe.parcours, code, etapes, classe)}
      onclasses={(c) => sauverBibliotheque(attribuer($state.snapshot(bibliotheque) as Bibliotheque, pe.parcours.id, c))}
      onexporter={() => exporterParcoursChoisis([pe.parcours.id])}
      ondupliquer={() => creer(copie(pe.parcours))}
      onsupprimer={async () => {
        await sauverBibliotheque(supprimer($state.snapshot(bibliotheque) as Bibliotheque, pe.parcours.id))
        versCreer()
      }}
      onsession={ouvrirSession}
    />
  {:else if vue === 'relecture' && relue}
    <Relecture parcours={relue.contenu} seance={relue} {moteur} onretour={() => aller('parcours')} onqrmontre={() => marquerQrMontre(relue!)} {prenom} onprenom={changerPrenom} />
  {:else if vue === 'seance' && seance}
    {#key seance.debut}
      <Seance
        parcours={seance.contenu}
        bind:seance
        {moteur}
        onsauver={sauverSeance}
        bilanDirect={estTest(seance.parcours) || (modeQr(seance.code) === 'avant' && !seance.qrMontre)}
        onquitter={quitterSeance}
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
      oncontinuer={palierDuBilan?.suite?.ouvert ? () => commencer(actif!, palierDuBilan!.suite!.etapes) : undefined}
      onfiche={(f) => ouvrirCours(f)}
      onqrmontre={() => marquerQrMontre(seance!)}
      {prenom}
      onprenom={changerPrenom}
    />
  {/if}
  </div>
  {/key}
  {#if scanSession}
    <Scanner session nb={0} onlu={lireInvitation} onfermer={() => (scanSession = false)} />
  {/if}
  {#if invitationAncienne}
    {@const inv = invitationAncienne}
    <Feuille onfermer={() => (invitationAncienne = null)}>
      <p role="alert" class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Mets l’application à jour</p>
      <p class="text-sm">Ton application a des exercices plus anciens que ceux de ton enseignant : certaines questions seront différentes.</p>
      <div class="flex flex-row gap-3">
        <button type="button" class="{boutonInverse} flex-1" style="min-height: 44px" onclick={() => (invitationAncienne = null)}>Annuler</button>
        <button type="button" class="{boutonAction} flex-1" style="min-height: 44px" onclick={() => rejoindreSession(inv)}>Continuer quand même</button>
      </div>
    </Feuille>
  {/if}
</div>

<ChoixEnregistrement />
