<script lang="ts">
  import { browser } from '$app/environment';
  import Item from './Item.svelte';
  import { store } from './store';

  $: if (browser) {
    let top = 0;
    for (const toast of $store) {
      toast.top = top;
      top += toast.height + 8;
    }
  }
</script>

<div class="fixed right-8 top-8 z-100 flex flex-col gap-2">
  {#each $store as toast (toast.id)}
    <Item {toast} />
  {/each}
</div>
