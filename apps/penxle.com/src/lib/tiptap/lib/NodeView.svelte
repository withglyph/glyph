<script lang="ts">
  import { clsx } from 'clsx';

  let _class: string | undefined;
  export { _class as class };
  export let as: keyof HTMLElementTagNameMap = 'div';
</script>

<svelte:element this={as} class={clsx('font-sans', _class)} data-node-view {...$$restProps}>
  <slot />
</svelte:element>
