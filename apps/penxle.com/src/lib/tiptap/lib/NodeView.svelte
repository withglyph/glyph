<script lang="ts">
  import { getContext } from 'svelte';

  let _class: string | undefined = undefined;
  export { _class as class };
  export let as: keyof HTMLElementTagNameMap = 'div';

  const onDragStart = getContext('onDragStart');
</script>

<svelte:element this={as} class={_class} data-node-view {...$$restProps} role="presentation" on:dragstart={onDragStart}>
  <slot />
</svelte:element>
