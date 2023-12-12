<script lang="ts">
  import clsx from 'clsx';

  export let size: 'sm' | 'lg' = 'lg';
  let _class: string | undefined = undefined;
  export { _class as class };

  export let as: 'a' | 'label' = 'a';
  export let checked = false;
  export let name: string | undefined = undefined;
</script>

<svelte:element
  this={as}
  id={name}
  class={clsx(
    'rounded-8 cursor-pointer bg-gray-10 transition duration-300 border border-gray-10 truncate hover:(bg-gray-20 border-gray-20)',
    checked && 'border-gray-90!',
    size === 'sm' && 'px-3 h-6.5 body-13-m',
    size === 'lg' && 'py-1 px-4 h-8 body-16-sb',
    _class,
  )}
  role="button"
  tabindex="-1"
  {...$$restProps}
>
  {#if as === 'label'}
    <input class="hidden" aria-checked={checked} type="checkbox" on:change bind:checked />
  {/if}
  <slot />
</svelte:element>
