<script lang="ts">
  // Aperçu d'une sauvegarde avant de la restaurer (Réglages, ou premier
  // lancement sur un nouvel appareil, où il n'y a rien à remplacer). Dans les
  // Réglages, la fusion avec cet appareil est proposée d'abord (fusion.ts).
  import type { BilanFusion } from '$lib/fusion'
  import type { resumerSauvegarde } from '$lib/sauvegarde'
  import { boutonAction, boutonInverse } from './classes'
  import Feuille from './Feuille.svelte'

  let {
    resume: r,
    remplacer,
    onannuler,
    onconfirmer,
    fusion = null,
    onfusionner,
  }: {
    resume: ReturnType<typeof resumerSauvegarde>
    remplacer: boolean
    onannuler: () => void
    onconfirmer: () => void
    fusion?: BilanFusion | null // ce que la fusion ajouterait ; null : pas de fusion possible
    onfusionner?: () => void
  } = $props()
  const pluriel = (n: number, mot: string, suite = '') => `${n} ${mot}${n > 1 ? 's' : ''}${suite && ` ${suite}${n > 1 ? 's' : ''}`}`
  // Seulement ce que contient la sauvegarde
  const contenu = $derived(
    [
      r.dossiers && pluriel(r.dossiers, 'dossier', 'suivi'),
      r.passages && pluriel(r.passages, 'passage', 'terminé'),
      r.enCours && `${pluriel(r.enCours, 'séance')} en cours`,
      r.enseignant && `${r.parcoursEnseignant} parcours dans la bibliothèque`,
    ].filter(Boolean),
  )
  const ajouts = $derived(
    fusion
      ? [
          fusion.passagesAjoutes ? `${pluriel(fusion.passagesAjoutes, 'passage', 'terminé')} de l’autre appareil s’${fusion.passagesAjoutes > 1 ? 'ajoutent' : 'ajoute'}` : 'Aucun passage terminé à ajouter',
          fusion.seancesRemplacees && `${pluriel(fusion.seancesRemplacees, 'séance')} en cours ici ${fusion.seancesRemplacees > 1 ? 'sont remplacées' : 'est remplacée'} par une plus récente`,
          fusion.seancesIgnorees && `${pluriel(fusion.seancesIgnorees, 'séance')} en cours là-bas, plus ancienne${fusion.seancesIgnorees > 1 ? 's' : ''}, ${fusion.seancesIgnorees > 1 ? 'ne sont pas reprises' : 'n’est pas reprise'}`,
        ].filter(Boolean)
      : [],
  )
</script>

<Feuille onfermer={onannuler}>
  {#if fusion && onfusionner}
    <p class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Ajouter cette sauvegarde à cet appareil ?</p>
    <p class="text-sm">
      Sauvegarde du {new Date(r.creeeLe).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}. {ajouts.join(' ; ')}. Résultats, ceintures et révisions
      tiennent compte des deux appareils ; les réglages de celui-ci restent.
    </p>
    <button type="button" class="{boutonAction} w-full" style="min-height: 44px" onclick={onfusionner}>Fusionner</button>
    <div class="flex flex-row gap-3">
      <button type="button" class="{boutonInverse} flex-1" style="min-height: 44px" onclick={onannuler}>Annuler</button>
      <button type="button" class="{boutonInverse} flex-1" style="min-height: 44px" onclick={onconfirmer}>Tout remplacer</button>
    </div>
    <p class="text-sm">« Tout remplacer » efface ce qui est sur cet appareil. Dans les deux cas, « Annuler la dernière restauration » rétablit l’état actuel.</p>
  {:else}
  <p class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">{remplacer ? 'Remplacer les données de cet appareil ?' : 'Récupérer ces données ?'}</p>
  <p class="text-sm">
    Sauvegarde du {new Date(r.creeeLe).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}{contenu.length ? ` : ${contenu.join(', ')}` : ''}.
  </p>
  {#if remplacer}
    <p class="text-sm">Tout ce qui est sur cet appareil est remplacé. L’état actuel est gardé : « Annuler la dernière restauration » le rétablit.</p>
  {/if}
  <div class="flex flex-row gap-3">
    <button type="button" class="{boutonInverse} flex-1" style="min-height: 44px" onclick={onannuler}>Annuler</button>
    <button type="button" class="{boutonAction} flex-1" style="min-height: 44px" onclick={onconfirmer}>{remplacer ? 'Remplacer' : 'Récupérer'}</button>
  </div>
  {/if}
</Feuille>
