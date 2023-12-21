<script lang="ts">
  import clsx from 'clsx';

  export let size: 'sm' | 'lg' = 'lg';
  let _class: string | undefined = undefined;
  export { _class as class };

  export let as: 'div' | 'a' | 'label' = 'a';
  export let checked = false;
  export let name: string | undefined = undefined;
</script>

<svelte:element
  this={as}
  id={name}
  class={clsx(
    'rounded-8 bg-gray-10 transition duration-300 border border-gray-10 leading-none py-1 truncate',
    checked && 'border-gray-90!',
    size === 'sm' && 'px-2 body-13-m',
    size === 'lg' && 'px-4 body-16-sb',
    as !== 'div' && 'hover:(bg-gray-20 border-gray-20)',
    _class,
  )}
  {...$$restProps}
>
  {#if as === 'label'}
    <input class="appearance-none" aria-checked={checked} type="checkbox" on:change bind:checked />
  {/if}
  <slot />
</svelte:element>
