<script lang="ts">
  import { onMount } from 'svelte'
  import type { Parcours } from '$lib/catalogue'
  import { exporterSauvegarde, restaurerSauvegarde } from '$lib/sauvegarde'
  import { chargerMoteur, chercherMiseAJourMoteur, infoMoteur, type Moteur, type Pays } from '$lib/moteur'
  import { dansTauri } from '$lib/stockage'
  import { enregistrerFichier, partageNatif } from '$lib/fichiers'
  import {
    adopter,
    definirLien,
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
  import { ecrireClasses, lireClasses, lireExplorer, lireFichier, NOM_FICHIER, synchroniserClasse, type Classe } from '$lib/partage'
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
    terminerSeance,
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
  import PiedDePage from '$lib/ui/PiedDePage.svelte'
  import { navigation } from '$lib/navigation.svelte'

  type Vue = 'accueil' | 'parcours' | 'seance' | 'bilan' | 'reglages' | 'relecture' | 'enseignant' | 'creation' | 'apercu'

  let stockage: Stockage | undefined
  let pret = $state(false)
  let moteur: Moteur | undefined = $state()
  let erreurMoteur = $state('')
  let profil: Profil | null = $state(null)
  let pays: Pays = $state('FR')
  let vue: Vue = $state('accueil')
  let onglet: 'mes' | 'explorer' | 'suivi' = $state('mes')
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

  /** Mise à jour du moteur : installée en arrière-plan, utilisée au prochain lancement */
  async function chercherMoteur(): Promise<string> {
    try {
      const version = await chercherMiseAJourMoteur()
      if (version) miseAJourMoteur = version
      return version ? '' : 'Le moteur est à jour.'
    } catch (e) {
      console.warn('Mise à jour du moteur', e)
      return 'Mise à jour impossible pour le moment (connexion ou serveur indisponible).'
    }
  }
  const aChoisir = $derived(classes.filter((c) => !c.nom && c.disponibles.length > 1).map((c) => ({ lien: c.lien, disponibles: c.disponibles })))
  // Enseignant
  let bibliotheque: Bibliotheque = $state({ classes: [], parcours: [] })
  let creation: { classes: string[]; parcours: Parcours; cle: number } | null = $state(null)
  let apercu: TSeance | undefined = $state()

  // Aucun parcours intégré : tout vient des dossiers partagés
  const sources: Source[] = $derived(classes.filter((c) => c.nom).map((c) => ({ id: c.lien, nom: c.nom, parcours: c.parcours })))
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
        fait: enCours && s ? premiersEssais(s).size : 0,
        sur: enCours && s ? questionsDe(s).length || totalQuestions(p) : totalQuestions(p),
        enCours,
        pourcentage: derniersComplets[p.id] ?? null,
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
    ajoutes = (await stockage.lire<Parcours[]>('ajoutes')) ?? []
    bibliotheque = await lireBibliotheque(stockage)
    importes = (await stockage.lire<Parcours[]>('importes')) ?? []
    classesImportees = (await stockage.lire<Record<string, string[]>>('importes-classes')) ?? {}
    for (const p of tous) await chargerParcours(p)
    vue = profil === 'enseignant' ? 'enseignant' : 'accueil'
    pret = true
    try {
      moteur = await chargerMoteur()
      moteur.definirLangue(pays === 'CH' ? 'fr-CH' : 'fr-FR')
      void chercherMoteur()
    } catch (e) {
      erreurMoteur = (e as Error).message
    }
    // Nouvelles versions des dossiers partagés au lancement
    if (classes.length) void synchroniserClasses()
    void synchroniserExplorer()
  })

  /** Nouvelle version du catalogue ; les parcours ajoutés suivent leur nouvelle version */
  async function synchroniserExplorer() {
    try {
      const recu = await lireExplorer()
      catalogue = recu
      await stockage!.ecrire('explorer', recu)
      ajoutes = ajoutes.map((a) => recu.find((p) => p.id === a.id) ?? a)
      await stockage!.ecrire('ajoutes', $state.snapshot(ajoutes))
      for (const p of ajoutes) await chargerParcours(p)
    } catch (e) {
      // Hors connexion ou adresse indisponible : la copie locale reste affichée
      console.warn('Explorer', e)
    }
  }

  async function basculerAjout(p: Parcours) {
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
    await stockage!.ecrire('profil', p)
  }

  function aller(v: Vue) {
    vue = v
    scrollTo(0, 0)
  }

  const accueil = () => aller(profil === 'enseignant' ? 'enseignant' : 'accueil')
  navigation.versAccueil = () => {
    // Aperçu : retour à l'éditeur, qui protège lui-même le brouillon
    if (vue === 'apercu') return aller('creation')
    if (profil === 'enseignant') creation = null
    else onglet = 'mes'
    accueil()
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

  function commencer(p: Parcours) {
    actif = p
    const existante = seances[p.id]
    void lancer(existante && !existante.fin ? existante : nouvelleSeance(p, moteur!.VERSION_MOTEUR))
  }

  const refaire = () => void lancer(nouvelleSeance(actif!, moteur!.VERSION_MOTEUR))
  const session = (code: string) => void lancer(nouvelleSeance(actif!, moteur!.VERSION_MOTEUR, 'complet', undefined, code))

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
    if (s.type === 'complet') {
      derniersComplets[s.parcours] = bilan(s).pourcentage
      await stockage!.ecrire(`complet:${s.parcours}`, derniersComplets[s.parcours])
    }
    aller('bilan')
  }

  function revenirAuxPassees() {
    const s = seance!
    const premiere = bilan(s).passees[0]
    s.fin = undefined
    s.position = questionsDe(s).findIndex((q) => q.etape === premiere.etape && q.question === premiere.question)
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
    for (const p of c.parcours) await chargerParcours(p)
    return null
  }

  async function synchroniserClasses() {
    classes = await Promise.all(classes.map((c) => synchroniserClasse($state.snapshot(c) as Classe)))
    await ecrireClasses(stockage!, classes)
    for (const c of classes) for (const p of c.parcours) await chargerParcours(p)
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

  function creer(p: Parcours = parcoursVide(), classesParcours: string[] = []) {
    creation = { classes: classesParcours, parcours: p, cle: Date.now() }
    aller('creation')
  }

  // Parcours qui vient d'être enregistré : l'espace enseignant propose de le télécharger
  let dernier: string | null = $state(null)

  async function valider(classesParcours: string[], p: Parcours) {
    const b = enregistrer($state.snapshot(bibliotheque) as Bibliotheque, classesParcours, p)
    await sauverBibliotheque(b)
    // Création : l'identifiant est attribué par enregistrer(), c'est le dernier ajouté
    dernier = p.id || b.parcours.at(-1)!.parcours.id
    creation = null
    aller('enseignant')
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

  function voirApercu(p: Parcours) {
    apercu = nouvelleSeance({ ...p, id: p.id || 'apercu' }, moteur!.VERSION_MOTEUR)
    aller('apercu')
  }

  async function exporterClasse() {
    const { texte, bibliotheque: b } = exporter($state.snapshot(bibliotheque) as Bibliotheque)
    if (!(await enregistrerFichier(NOM_FICHIER, texte))) return 'Export annulé.'
    await sauverBibliotheque(b)
    return partageNatif
      ? `Choisissez l’app de votre drive et déposez ${NOM_FICHIER} dans le dossier partagé.`
      : `${NOM_FICHIER} enregistré : déposez-le dans le dossier partagé, en remplaçant l’ancien.`
  }

</script>

<svelte:head>
  <title>MathALÉA</title>
</svelte:head>

<div class="colonne">
  {#if erreurMoteur}
    <p class="p-4 font-bold text-coopmaths-action" role="alert">Moteur MathALÉA indisponible : {erreurMoteur}</p>
  {/if}

  {#if !moteur || !pret}
    <!-- rien tant que le moteur (et sa feuille de style) n'est pas chargé -->
  {:else if profil === null}
    <ChoixProfil
      onchoisir={async (pa, pr) => {
        await changerPays(pa)
        await changerProfil(pr)
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
      moteur={moteur ? infoMoteur() : null}
      {miseAJourMoteur}
      onchercherMoteur={dansTauri ? chercherMoteur : null}
    />
  {:else if vue === 'enseignant'}
    <EspaceEnseignant
      {bibliotheque}
      modeles={modeles}
      onouvrir={(pe) => creer(pe.parcours, pe.classes)}
      oncreer={() => creer()}
      {dernier}
      onfermerDernier={() => (dernier = null)}
      onexporterUn={exporterUnParcours}
      onimporter={importerFichier}
      ondeplacer={(id, classe, sens) => sauverBibliotheque(deplacer($state.snapshot(bibliotheque) as Bibliotheque, id, classe, sens))}
      onediter={async (p) => {
        await sauverBibliotheque(adopter($state.snapshot(bibliotheque) as Bibliotheque, p, classesDuModele(p.id)))
        const pe = bibliotheque.parcours.find((x) => x.parcours.id === p.id)!
        creer(pe.parcours, pe.classes)
      }}
      onlien={(lien) => sauverBibliotheque(definirLien($state.snapshot(bibliotheque) as Bibliotheque, lien))}
      onexporter={exporterClasse}
      onreglages={() => aller('reglages')}
    />
  {:else if vue === 'creation' || vue === 'apercu'}
    {#if creation}
      <!-- Gardé monté pendant l'aperçu : la saisie n'est pas perdue -->
      <div hidden={vue === 'apercu'}>
        {#key creation.cle}
          <CreationParcours
            {bibliotheque}
            classesInitiales={creation.classes}
            classesDossiers={[...new Set(classesDesDossiers.map((c) => c.nom))]}
            chapitresDossiers={classesDesDossiers.flatMap((c) => c.parcours.map((p) => ({ classe: c.nom, theme: p.theme })))}
            parcours={creation.parcours}
            {moteur}
            {pays}
            onvalider={valider}
            onapercu={voirApercu}
            ondupliquer={creation.parcours.id ? (classesCopie, p) => creer(copie(p), classesCopie) : undefined}
            onexporter={creation.parcours.id ? () => exporterUnParcours(creation!.parcours.id) : undefined}
            onsupprimer={creation.parcours.id
              ? async () => {
                  await sauverBibliotheque(supprimer($state.snapshot(bibliotheque) as Bibliotheque, creation!.parcours.id))
                  creation = null
                  aller('enseignant')
                }
              : undefined}
            onretour={() => {
              creation = null
              aller('enseignant')
            }}
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
      bind:onglet
      onouvrir={ouvrir}
      oncontinuer={commencer}
      onreglages={() => aller('reglages')}
      onajouter={ajouterClasse}
      onchoisirClasse={choisirClasse}
      onorganiser={async (source, o) => {
        organisations = { ...organisations, [source]: o }
        await stockage!.ecrire('chapitres', $state.snapshot(organisations))
      }}
    >
      {#snippet suivi()}
        <Suivi parcours={tous} {historiques} enCours={seances} onouvrir={ouvrir} />
      {/snippet}
    </Accueil>
  {:else if vue === 'parcours' && actif}
    <DetailParcours
      parcours={actif}
      resultats={resultats[actif.id] ?? {}}
      enCours={resumes[actif.id]?.enCours ?? false}
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
      oncommencer={() => commencer(actif!)}
      onrefaire={refaire}
      onameliorer={ameliorer}
      onsession={session}
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
        onquitter={() => aller('parcours')}
        onterminer={terminer}
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
      onfermer={() => aller('parcours')}
    />
  {/if}
  {#if moteur && pret && profil !== null && vue !== 'seance' && vue !== 'apercu'}
    <PiedDePage />
  {/if}
</div>
