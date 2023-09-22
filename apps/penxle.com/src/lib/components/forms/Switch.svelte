<script lang="ts">
  import { clsx } from 'clsx';

  type $$Events = {
    change: Event & { currentTarget: HTMLInputElement };
  };

  export let size: 'sm' | 'lg' = 'lg';
  export let checked = false;
  let _class: string | undefined = undefined;
  export { _class as class };
  export let disabled = false;
</script>

<input
  class={clsx(
    'relative flex items-center aspect-2/1 p-1 rounded-full transition appearance-none bg-gray-20 justify-start cursor-pointer checked:(bg-green-50 justify-end) after:(rounded-full content-empty bg-white aspect-1/1) disabled:(bg-gray-20! justify-start! cursor-auto) disabled:after:bg-gray-10',
    size === 'sm' && 'w-7.5 h-4 rounded-6 after:h-150%',
    size === 'lg' && 'w-11 h-6 rounded-9 after:h-full',
    _class,
  )}
  {disabled}
  type="checkbox"
  on:change
  bind:checked
  {...$$restProps}
/>
