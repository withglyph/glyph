<script lang="ts">
  export let activeTabValue: number;
  export let id: number;
</script>

{#if activeTabValue === id}
  <div id="{id}-tabitem" aria-labelledby="{id}-tab" role="tabpanel">
    <slot />
  </div>
{/if}
