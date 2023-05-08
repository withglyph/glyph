<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import { portal } from '$lib/svelte/actions';

  export let open: boolean;
</script>

{#if open}
  <div class="fixed inset-0 z-50" use:portal>
    <div
      class="absolute inset-0 bg-black opacity-50"
      on:click={() => (open = false)}
      transition:fade={{ duration: 150 }}
    />

    <div class="pointer-events-none absolute inset-0 flex center">
      <div
        class="pointer-events-auto rounded-lg bg-white p-8"
        transition:scale={{ start: 0.95, duration: 200 }}
      >
        <slot />
      </div>
    </div>
  </div>
{/if}
