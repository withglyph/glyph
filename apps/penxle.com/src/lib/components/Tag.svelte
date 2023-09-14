<script lang="ts">
  import clsx from 'clsx';

  export let size: 'sm' | 'lg' = 'lg';
  export let state: 'default' | 'select' = 'default';
</script>

<button
  class={clsx(
    'px-4 rounded-lg bg-gray-5 transition border border-gray-5 hover:(border-gray-30)',
    size === 'sm' && 'h-6.5 text-3.25',
    size === 'lg' && 'py-1 h-8 text-3.75',
    state === 'select' && 'border-gray-90',
  )}
  type="button"
  on:click
>
  <slot />
</button>
