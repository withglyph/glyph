<script lang="ts">
  import clsx from 'clsx';
  import type { ComponentType } from 'svelte';

  export let icon: ComponentType;
  let _class: string | undefined = undefined;
  export { _class as class };
</script>

<svelte:component this={icon} class={clsx('iconify-icon', _class)} />
