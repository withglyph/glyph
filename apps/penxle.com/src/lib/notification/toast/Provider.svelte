<script lang="ts">
  import Item from './Item.svelte';
  import { store } from './store';
</script>

<div
  class="fixed left-0 bottom-0 w-100vw px-5 py-4 z-100 space-y-2 pointer-events-none"
>
  {#each $store as toast (toast.id)}
    <Item {toast} />
  {/each}
</div>
