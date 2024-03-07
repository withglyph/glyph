<script lang="ts">
  import { flex } from '$styled-system/patterns';
  import Item from './Item.svelte';
  import { store } from './store';
</script>

<div
  class={flex({
    position: 'fixed',
    left: '0',
    bottom: '0',
    direction: 'column',
    gap: '8px',
    paddingX: '20px',
    paddingY: '16px',
    width: 'screen',
    zIndex: '100',
    pointerEvents: 'none',
  })}
>
  {#each $store as toast (toast.id)}
    <Item {toast} />
  {/each}
</div>
