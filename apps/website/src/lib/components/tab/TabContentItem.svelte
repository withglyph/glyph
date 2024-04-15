<script lang="ts">
  import { page } from '$app/stores';

  export let activeTabValue: number | undefined = undefined;
  export let id: number;
  export let href: string | undefined = undefined;
</script>

{#if activeTabValue === id || $page.url.pathname === href}
  <div id="{id}-tabitem" aria-labelledby="{id}-tab" role="tabpanel">
    <slot />
  </div>
{/if}
