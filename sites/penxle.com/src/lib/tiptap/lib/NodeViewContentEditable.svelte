<script lang="ts">
  export let as: keyof HTMLElementTagNameMap = 'div';
</script>

<svelte:element this={as} data-node-view-content-editable {...$$restProps}>
  <slot />
</svelte:element>
