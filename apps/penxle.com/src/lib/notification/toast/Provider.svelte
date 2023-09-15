<script lang="ts">
  import Item from './Item.svelte';
  import { store } from './store';
</script>

<div class="fixed left-8 bottom-8 z-100 flex flex-col gap-2">
  {#each $store as toast (toast.id)}
    <Item {toast} />
  {/each}
</div>
