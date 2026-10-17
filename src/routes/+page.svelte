<script lang="ts">
  import { onMount } from 'svelte'
  import { nomPalier, paliersDe, type Parcours } from '$lib/catalogue'
  import { CLE_AVANT_RESTAURATION, exporterSauvegarde, restaurerSauvegarde, resumerSauvegarde } from '$lib/sauvegarde'
  import { chargerMoteur, chercherMiseAJourMoteur, infoMoteur, misesAJourMoteur, type Moteur, type Pays } from '$lib/moteur'
  import { dansTauri } from '$lib/stockage'
  import { enregistrerFichier, partageNatif } from '$lib/fichiers'
  import {
    adopter,
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
    exporterUn,
    deplacer,
    copie,
    CLASSE_SANS_NOM,
    lireBibliotheque,
    parcoursVide,
    supprimer,
    type Bibliotheque,
  } from '$lib/bibliotheque'
  import { ceinturesObtenues, completerListe, etatsPaliers, fusionnerObjectifs, memoriser, objectifsEnCsv, type Objectif } from '$lib/objectifs'
  import { LIEN_DEMONSTRATION, ecrireClasses, lireClasses, lireExplorer, lireFichier, lireFichierDistant, nomHorodate, synchroniserClasse, type Classe } from '$lib/partage'
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
  import ChoixProfil from '$lib/ui/ChoixProfil.svelte'
  import CreationParcours from '$lib/ui/CreationParcours.svelte'
  import DetailParcours from '$lib/ui/DetailParcours.svelte'
  import EspaceEnseignant from '$lib/ui/EspaceEnseignant.svelte'
  import Reglages, { type Profil } from '$lib/ui/Reglages.svelte'
  import Relecture from '$lib/ui/Relecture.svelte'
  import Seance from '$lib/ui/Seance.svelte'
  import Suivi from '$lib/ui/Suivi.svelte'
  import TestNiveau from '$lib/ui/TestNiveau.svelte'
  import { NB_QUESTIONS, NIVEAUX_TEST, SEUIL_TEST, ceintureDu, couleurDu, estTest, niveauDuTest, presenterTest, sujetsDu, tirerTest, type EtatTest } from '$lib/testNiveau'
  import type { ExerciceDuReferentiel } from '$lib/moteur'
  import { navigation, retourDeBase } from '$lib/navigation.svelte'

  type Vue = 'accueil' | 'parcours' | 'seance' | 'bilan' | 'reglages' | 'relecture' | 'creation' | 'apercu' | 'test'

  let stockage: Stockage | undefined
  let pret = $state(false)
  let moteur: Moteur | undefined = $state()
  let erreurMoteur = $state('')
  let profil: Profil | null = $state(null)
  let pays: Pays = $state('FR')
  let vue: Vue = $state('accueil')
  // « creer » : seulement avec le réglage Enseignant
  let onglet: 'mes' | 'explorer' | 'suivi' | 'creer' = $state('mes')
  let actif: Parcours | undefined = $state()
  let seance: TSeance | undefined = $state()
  let relue: TSeance | undefined = $state()
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
    classes = await lireClasses(stockage)
    epingles = (await stockage.lire<string[]>('epingles')) ?? []
    organisations = (await stockage.lire<Record<string, Organisation>>('chapitres')) ?? {}
    catalogue = await stockage.lire<Parcours[]>('explorer')
    // Un test ajouté à l'accueil par une version précédente : il vit dans Teste ton niveau
    ajoutes = ((await stockage.lire<Parcours[]>('ajoutes')) ?? []).filter((p) => !estTest(p.id))
    bibliotheque = await lireBibliotheque(stockage)
    importes = (await stockage.lire<Parcours[]>('importes')) ?? []
    classesImportees = (await stockage.lire<Record<string, string[]>>('importes-classes')) ?? {}
    objectifs = (await stockage.lire<Objectif[]>('objectifs')) ?? []
    etiquettes = (await stockage.lire<Record<string, string[]>>('etiquettes')) ?? {}
    preferences = (await stockage.lire<Preferences>('preferences-creation')) ?? {}
    etatTest = (await stockage.lire<EtatTest>('test-niveau')) ?? {}
    for (const e of Object.values(etatTest)) if (e.tirage) e.tirage = presenterTest(e.tirage)
    for (const e of Object.values(etatTest)) if (e.tirage) await chargerParcours(e.tirage)
    for (const p of catalogue ?? []) await chargerParcours(p)
    restaurationAnnulable = !!(await stockage.lire<string>(CLE_AVANT_RESTAURATION))
    for (const p of tous) await chargerParcours(p)
    vue = 'accueil'
    // Réglage Enseignant : l'app s'ouvre sur l'onglet Créer
    if (profil === 'enseignant') onglet = 'creer'
    pret = true
    try {
      moteurMisAJour = await misesAJourMoteur()
      moteur = await chargerMoteur()
      moteur.definirLangue(pays === 'CH' ? 'fr-CH' : 'fr-FR')
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
    actualisation = Promise.all([classes.length ? synchroniserClasses() : null, synchroniserExplorer(), moteur && moteurMisAJour ? chercherMoteur() : null]).finally(
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
    return () => {
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
    await stockage!.ecrire('pays', p)
  }

  async function changerProfil(p: Profil) {
    profil = p
    // Réglage Enseignant coché : l'onglet Créer s'ouvre au retour des réglages
    onglet = p === 'enseignant' ? 'creer' : onglet === 'creer' ? 'mes' : onglet
    await stockage!.ecrire('profil', p)
  }

  // Profondeur de chaque écran : un écran plus profond arrive par la droite, un retour par la gauche
  const PROFONDEUR: Record<Vue, number> = { accueil: 0, reglages: 1, parcours: 1, test: 1, creation: 1, seance: 2, relecture: 2, bilan: 2, apercu: 2 }
  let sens: 'avant' | 'arriere' = $state('avant')
  // L'aperçu garde l'éditeur monté : même écran pour l'animation
  const ecran = $derived.by((): Vue => (vue === ('apercu' as Vue) ? 'creation' : vue))

  function aller(v: Vue) {
    sens = PROFONDEUR[v] < PROFONDEUR[vue] ? 'arriere' : 'avant'
    vue = v
    scrollTo(0, 0)
  }

  const accueil = () => aller('accueil')
  // Espace enseignant : onglet « Créer » de l'accueil
  function versCreer() {
    creation = null
    onglet = 'creer'
    aller('accueil')
  }
  navigation.versAccueil = () => {
    // Aperçu : retour à l'éditeur, qui protège lui-même le brouillon
    if (vue === 'apercu') return aller('creation')
    creation = null
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
      creation: versCreer,
      apercu: () => aller('creation'),
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
    aller(estTest(seance?.parcours) ? 'test' : 'parcours')
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
    const existante = seances[p.id]
    const memes = !etapes || (existante && existante.etapes.join() === etapes.join())
    void lancer(existante && !existante.fin && memes ? existante : nouvelleSeance(p, moteur!.VERSION_MOTEUR, 'complet', etapes))
  }

  // Refaire : les mêmes exercices que la dernière tentative (un palier, ou tout le parcours)
  const refaire = () => void lancer(nouvelleSeance(actif!, moteur!.VERSION_MOTEUR, 'complet', seances[actif!.id]?.etapes))
  /** Bilan d'une séance de palier : nom, pause, et palier suivant avec son état d'après les nouveaux résultats */
  const palierDuBilan = $derived.by(() => {
    if (!seance || !actif || seance.contenu.id !== actif.id) return null
    const etats = etatsPaliers(actif, resultats[actif.id] ?? {})
    if (etats.length < 2) return null
    const k = etats.findIndex((x) => x.etapes.join() === seance!.etapes.join())
    if (k === -1) return null
    const suivant = etats[k + 1]
    return {
      nom: nomPalier(actif, k),
      pause: etats[k].pause,
      ressource: etats[k].ressource,
      suite: suivant
        ? {
            nom: nomPalier(actif, k + 1),
            ouvert: suivant.ouvert,
            etapes: suivant.etapes,
            condition: `au moins ${suivant.seuil} % (${etats[k].fini ? `tu as ${etats[k].pourcentage} %` : 'termine tous ses exercices'})`,
          }
        : null,
    }
  })

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
    return (await enregistrerFichier(nom, await exporterSauvegarde(stockage!))) ? `${nom} enregistré.` : 'Sauvegarde annulée.'
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

  function creer(p: Parcours = parcoursVide(preferences)) {
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
    // Création : l'identifiant est attribué par enregistrer(), c'est le dernier ajouté
    dernier = p.id || b.parcours.at(-1)!.parcours.id
    versCreer()
  }

  async function exporterUnParcours(id: string) {
    const f = exporterUn($state.snapshot(bibliotheque) as Bibliotheque, id)
    if (!f) return ''
    if (!(await enregistrerFichier(f.nom, f.texte))) return 'Téléchargement annulé.'
    await sauverBibliotheque(f.bibliotheque)
    return partageNatif ? `Choisissez l’app de votre drive et déposez ${f.nom} dans le dossier partagé.` : `${f.nom} enregistré.`
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
      await sauverBibliotheque(b)
      if (f.bibliotheque?.objectifs?.length) await sauverObjectifs(fusionnerObjectifs($state.snapshot(objectifs) as Objectif[], f.bibliotheque.objectifs))
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
      await sauverBibliotheque(reprendre($state.snapshot(bibliotheque) as Bibliotheque, f))
      let liste = $state.snapshot(objectifs) as Objectif[]
      for (const p of c.parcours) liste = completerListe(liste, p.etapes.flatMap((e) => e.objectifs ?? []), p.niveau, p.theme)
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
    await sauverBibliotheque({ ...b, classes: b.classes.filter((x) => x.nom !== c.nom), parcours: b.parcours.filter((pe) => !ids.has(pe.parcours.id)) })
    return 'Parcours de démonstration retirés. Vos résultats d’essai restent dans le Suivi.'
  }

  function voirApercu(p: Parcours) {
    apercu = nouvelleSeance({ ...p, id: p.id || 'apercu' }, moteur!.VERSION_MOTEUR)
    aller('apercu')
  }

  /** Le dossier partagé contient-il le dernier fichier publié ? */
  async function verifierDossier(): Promise<string> {
    if (!bibliotheque.lien) return ''
    try {
      const dossier = await lireFichierDistant(bibliotheque.lien)
      if (!publicationPresente(bibliotheque, dossier)) {
        return 'Le dossier ne contient pas encore le dernier fichier publié : déposez-le, puis vérifiez à nouveau.'
      }
      await sauverBibliotheque({ ...($state.snapshot(bibliotheque) as Bibliotheque), verifieLe: new Date().toISOString() })
      return 'Le dossier contient la dernière publication : les élèves la reçoivent au prochain lancement de leur app.'
    } catch (e) {
      return (e as Error).message
    }
  }

  async function exporterClasse() {
    const { texte, bibliotheque: b } = exporter($state.snapshot(bibliotheque) as Bibliotheque, $state.snapshot(objectifs) as Objectif[])
    const nom = nomHorodate('parcours-mathalea')
    if (!(await enregistrerFichier(nom, texte))) return 'Export annulé.'
    await sauverBibliotheque(b)
    return partageNatif
      ? 'Choisissez l’app de votre drive et déposez le fichier dans le dossier partagé.'
      : `${nom} enregistré : déposez-le dans le dossier partagé.`
  }

</script>

<svelte:head>
  <title>MathALÉA</title>
</svelte:head>

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
            onexporter={creation.parcours.id ? () => exporterUnParcours(creation!.parcours.id) : undefined}
            onsupprimer={creation.parcours.id
              ? async () => {
                  await sauverBibliotheque(supprimer($state.snapshot(bibliotheque) as Bibliotheque, creation!.parcours.id))
                  versCreer()
                }
              : undefined}
            onretour={versCreer}
          />
        {/key}
      </div>
    {/if}
    {#if vue === 'apercu' && apercu}
      {#key apercu.debut}
        <Seance parcours={apercu.contenu} bind:seance={apercu} {moteur} onsauver={() => {}} onquitter={() => aller('creation')} onterminer={() => aller('creation')} />
      {/key}
    {/if}
  {:else if vue === 'accueil'}
    <Accueil
      {sources}
      {catalogue}
      {ajoutes}
      {aChoisir}
      {organisations}
      {resumes}
      {epingles}
      enseignant={profil === 'enseignant'}
      bind:onglet
      onouvrir={ouvrir}
      oncontinuer={commencer}
      onreglages={() => aller('reglages')}
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
        />
      {/snippet}
      {#snippet espaceEnseignant()}
      <EspaceEnseignant
        {bibliotheque}
        modeles={modeles}
        {objectifs}
        {pays}
        onouvrir={(pe) => creer(pe.parcours)}
        oncreer={() => creer()}
        {dernier}
        onfermerDernier={() => (dernier = null)}
        onexporterUn={exporterUnParcours}
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
    />
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
        onquitter={quitterSeance}
        onterminer={terminer}
        onsupprimer={() => supprimerTentative(seance!.parcours)}
      />
    {/key}
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
      oncontinuer={palierDuBilan?.suite?.ouvert ? () => commencer(actif!, palierDuBilan!.suite!.etapes) : undefined}
    />
  {/if}
  </div>
  {/key}
</div>
