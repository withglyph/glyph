<script lang="ts">
  import clsx from 'clsx';

  export let size: 'sm' | 'lg' = 'lg';
  export let state: 'default' | 'select' = 'default';
</script>

<button
  class={clsx(
    'rounded-8 bg-gray-10 transition border border-gray-10 font-bold hover:(bg-gray-20 border-gray-20)',
    size === 'sm' && 'px-3 h-6.5 text-3.25',
    size === 'lg' && 'py-1 px-4 h-8 text-3.75',
    state === 'select' && 'border-gray-90',
  )}
  type="button"
  on:click
>
  <slot />
</button>
