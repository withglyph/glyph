<script lang="ts">
  import { getContext } from 'svelte';

  let close = getContext<() => void>('close');
</script>

<button
  class="body-14-sb text-secondary px-4 py-3 w-full rounded-lg hover:(bg-primary text-primary)"
  type="button"
  on:click
  on:click={close}
>
  <slot />
</button>
