<script lang="ts">
  import { clsx } from 'clsx';
  import type { HTMLInputAttributes } from 'svelte/elements';

  type $$Events = {
    change: Event & { currentTarget: HTMLInputElement };
  };

  type $$Props = HTMLInputAttributes & { group: unknown };

  export let checked: $$Props['checked'] = undefined;
  export let group: $$Props['group'] = undefined;

  let _class: $$Props['class'] = undefined;
  export { _class as class };
</script>

<label
  class={clsx(
    'relative inline-flex p-x-0.875rem p-y-0.375rem text-12-sb transition-colors justify-center whitespace-nowrap rounded-0.375rem border-(1px gray-200) bg-gray-50 focus:(border-teal-500 color-teal-700) has-[:checked]:(border-teal-500 color-teal-700 bg-teal-50)',
    _class,
  )}
>
  <input
    class="apperance-none inset-0 invisible absolute square-full"
    aria-checked={checked}
    type="checkbox"
    on:change
    bind:checked
    bind:group
    {...$$restProps}
  />
  <slot />
</label>
