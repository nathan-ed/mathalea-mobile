<script lang="ts">
  // Android : envoyer le fichier vers une app (feuille de partage) ou
  // l'enregistrer sur le téléphone (sélecteur de fichiers)
  import { choixEnregistrement } from '$lib/choixEnregistrement.svelte'
  import { elementListe, listeGroupee } from './classes'
  import Feuille from './Feuille.svelte'

  const actions = [
    { choix: 'partager', icone: 'bx-share-alt', libelle: 'Envoyer vers une app (drive, courriel…)' },
    { choix: 'enregistrer', icone: 'bx-download', libelle: 'Enregistrer sur le téléphone' },
  ] as const
</script>

{#if choixEnregistrement.demande}
  {@const demande = choixEnregistrement.demande}
  <Feuille onfermer={() => demande.repondre(null)}>
    <p class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct break-all">{demande.nom}</p>
    <ul class={listeGroupee}>
      {#each actions as a (a.choix)}
        <li>
          <button type="button" class={elementListe} onclick={() => demande.repondre(a.choix)}>
            <span class="flex flex-row items-center gap-3 text-coopmaths-corpus dark:text-coopmathsdark-corpus">
              <i aria-hidden="true" class="bx {a.icone} text-2xl text-coopmaths-action dark:text-coopmathsdark-action"></i>
              {a.libelle}
            </span>
          </button>
        </li>
      {/each}
    </ul>
  </Feuille>
{/if}
