<script lang="ts">
  import { clsx } from 'clsx';
  import type { HTMLInputAttributes } from 'svelte/elements';

  type $$Events = {
    change: Event & { currentTarget: HTMLInputElement };
  };

  type $$Props = HTMLInputAttributes & {
    class?: string;
    size?: 'sm' | 'lg';
    checked?: boolean;
    disabled?: boolean;
  };

  export let size: 'sm' | 'lg' = 'lg';
  export let checked = false;
  let _class: string | undefined = undefined;
  export { _class as class };
  export let disabled = false;
</script>

<label class={clsx(_class)} for={$$restProps['name']}>
  <slot />
  <input
    id={$$restProps['name']}
    class={clsx(
      'relative flex items-center aspect-2/1 rounded-full transition appearance-none bg-gray-20 justify-start cursor-pointer checked:(bg-green-50 justify-end) after:(rounded-full content-empty bg-white aspect-1/1 h-full) disabled:(bg-white border border-gray-30 justify-start! cursor-not-allowed) disabled:after:bg-gray-30',
      size === 'sm' && 'w-7.5 h-4 p-0.5 rounded-6',
      size === 'lg' && 'w-11 h-6 p-1 rounded-9',
    )}
    {disabled}
    type="checkbox"
    on:change
    bind:checked
    {...$$restProps}
  />
</label>
