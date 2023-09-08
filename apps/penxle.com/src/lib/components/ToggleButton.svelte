<script lang="ts">
  import clsx from 'clsx';

  export let size: 'sm' | 'lg' = 'lg';
  export let pressed = false;
</script>

<button
  type="button"
  aria-pressed={pressed}
  class={clsx(
    'bg-gray-20  p-1',
    pressed && 'bg-green-50',
    size === 'sm' && 'w-7.5 h-4 rounded-6',
    size === 'lg' && 'w-11 h-6 rounded-9',
  )}
  on:click={() => (pressed = !pressed)}
>
  <div class="relative">
    <span
      class={clsx(
        'bg-gray-5 absolute left-0',
        size === 'sm' && 'square-3 rounded-1.5 -top-1.5',
        size === 'lg' && 'square-4 rounded-2 -top-2',
        pressed && size === 'sm' && 'translate-x-2.5',
        pressed && size === 'lg' && 'translate-x-5',
      )}
    />
  </div>
</button>
