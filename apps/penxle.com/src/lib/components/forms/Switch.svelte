<script lang="ts">
  import { clsx } from 'clsx';
  import type { HTMLInputAttributes } from 'svelte/elements';

  type $$Props = {
    size: 'sm' | 'lg';
  } & HTMLInputAttributes;

  export let checked: HTMLInputAttributes['checked'] = false;
  let _class: HTMLInputAttributes['class'] = undefined;
  export { _class as class };
  export let size: 'sm' | 'lg' = 'lg';
</script>

<input
  class={clsx(
    'relative flex items-center aspect-2/1 p-1 rounded-full transition appearance-none bg-gray-20 justify-start cursor-pointer checked:(bg-green-50 justify-end) after:(rounded-full content-empty bg-white aspect-1/1)',
    size === 'sm' && 'w-7.5 h-4 rounded-6 after:h-150%',
    size === 'lg' && 'w-11 h-6 rounded-9 after:h-full',
    _class,
  )}
  type="checkbox"
  bind:checked
  {...$$restProps}
/>
