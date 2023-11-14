<script lang="ts">
  import { clsx } from 'clsx';

  type $$Events = {
    change: Event & { currentTarget: HTMLInputElement };
  };

  export let name: string | undefined = undefined;
  export let size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  export let checked = false;
  let _class: string | undefined = undefined;
  export { _class as class };
</script>

<label
  class={clsx(
    'relative flex center px-4 py-2 cursor-pointer font-bold leading-none transition duration-300 text-center text-3.25 text-primary bg-transparent border border-secondary hover:border-primary active:(bg-primary border-tertiary) text-nowrap',
    checked && 'border-tertiary bg-surface-primary!',
    size === 'xs' && 'px-0! py-0! h-5.75 rounded-2xl',
    size === 'sm' && 'p-2! h-6.5 rounded-lg',
    size === 'md' && 'text-sm h-9 rounded-2.5',
    size === 'lg' && 'text-base h-10 rounded-xl',
    size === 'xl' && 'text-base h-12.5 rounded-2xl',
    _class,
  )}
>
  <input
    id={name}
    {name}
    class="hidden"
    aria-checked={checked}
    type="checkbox"
    on:change
    bind:checked
    {...$$restProps}
  />
  <slot />
</label>
