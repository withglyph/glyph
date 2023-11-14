<script lang="ts">
  let _class: string | undefined = undefined;
  export { _class as class };
  export let as: keyof HTMLElementTagNameMap = 'div';
</script>

<svelte:element this={as} class={_class} data-node-view {...$$restProps}>
  <slot />
</svelte:element>
