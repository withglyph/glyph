<script lang="ts">
  import { clsx } from 'clsx';
  import type { HTMLInputAttributes } from 'svelte/elements';

  type $$Events = {
    change: Event & { currentTarget: HTMLInputElement };
  };

  type $$Props = Omit<HTMLInputAttributes, 'size'> & {
    size?: 'sm' | 'lg';
  };

  export let size: 'sm' | 'lg' = 'lg';

  let _class: $$Props['class'] = undefined;
  export { _class as class };
  export let checked: boolean | null | undefined = undefined;
</script>

<label class={clsx(_class)} for={$$restProps['name']}>
  <slot />
  <input
    id={$$restProps['name']}
    class={clsx(
      'relative flex items-center aspect-2/1 rounded-full transition appearance-none bg-gray-200 justify-start cursor-pointer checked:(bg-teal-500 justify-end) after:(rounded-full content-empty bg-white aspect-1/1 h-full) disabled:(bg-white border border-gray-30 justify-start! cursor-not-allowed) disabled:after:bg-gray-30',
      size === 'sm' && 'w-7.5 h-4 p-0.5 rounded-6',
      size === 'lg' && 'w-11 h-6 p-1 rounded-9',
    )}
    type="checkbox"
    on:change
    bind:checked
    {...$$restProps}
  />
</label>
