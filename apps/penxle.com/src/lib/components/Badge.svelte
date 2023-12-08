<script lang="ts">
  import { clsx } from 'clsx';
  import type { HTMLAttributes } from 'svelte/elements';

  type $$Props = HTMLAttributes<HTMLDivElement> & { color?: typeof color };

  let _class: $$Props['class'] = undefined;
  export { _class as class };
  export let color: 'unselect' | 'select' | 'green' | 'red' | 'gray' = 'unselect';
</script>

<div
  class={clsx(
    'flex center h-6 p-2.5 rounded caption-12-b',
    color === 'unselect' && 'text-gray-5 bg-gray-80',
    color === 'select' && 'border border-gray-30',
    color === 'green' && 'text-green-50 bg-green-10',
    color === 'red' && 'text-red-50 bg-red-10',
    color === 'gray' && 'text-gray-50 bg-gray-10',
    _class,
  )}
  {...$$restProps}
>
  <slot />
</div>
