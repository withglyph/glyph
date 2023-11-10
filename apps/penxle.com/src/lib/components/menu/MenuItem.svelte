<script lang="ts">
  import clsx from 'clsx';
  import { getContext } from 'svelte';

  let close = getContext<() => void>('close');
  let _class: string | undefined = undefined;
  export { _class as class };
</script>

<button
  class={clsx('body-14-sb text-secondary px-4 py-3 w-full rounded-lg hover:(bg-primary text-primary)', _class)}
  type="button"
  on:click
  on:click={close}
>
  <slot />
</button>
