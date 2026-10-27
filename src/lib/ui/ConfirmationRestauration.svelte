<script lang="ts">
  // Aperçu d'une sauvegarde avant de la restaurer (Réglages, ou premier
  // lancement sur un nouvel appareil, où il n'y a rien à remplacer)
  import type { resumerSauvegarde } from '$lib/sauvegarde'
  import { boutonAction, boutonInverse } from './classes'
  import Feuille from './Feuille.svelte'

  let {
    resume: r,
    remplacer,
    onannuler,
    onconfirmer,
  }: { resume: ReturnType<typeof resumerSauvegarde>; remplacer: boolean; onannuler: () => void; onconfirmer: () => void } = $props()
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
</script>

<Feuille onfermer={onannuler}>
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
</Feuille>
