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
    'relative flex items-center aspect-2/1 rounded-full transition appearance-none bg-gray-20 justify-start cursor-pointer checked:(bg-green-50 justify-end) after:(rounded-full content-empty bg-white aspect-1/1 h-full) disabled:(bg-white border border-gray-30 justify-start! cursor-not-allowed) disabled:after:bg-gray-30',
    size === 'sm' && 'w-7.5 h-4 p-0.5 rounded-6',
    size === 'lg' && 'w-11 h-6 p-1 rounded-9',
    _class,
  )}
  {disabled}
  type="checkbox"
  on:change
  bind:checked
  {...$$restProps}
/>
