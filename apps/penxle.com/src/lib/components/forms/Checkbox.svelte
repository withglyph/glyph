<script lang="ts">
  import { clsx } from 'clsx';
  import { getFormContext } from '$lib/form';
  import type { HTMLInputAttributes } from 'svelte/elements';

  export let name: HTMLInputAttributes['name'] = undefined;
  export let checked: HTMLInputAttributes['checked'] = false;
  let _class: HTMLInputAttributes['class'] = undefined;
  export { _class as class };

  type $$Props = HTMLInputAttributes;

  const { field } = getFormContext();

  if (field) {
    name = field.name;
  }
</script>

<label class={clsx('flex items-center gap-1.5 select-none', _class)}>
  <input
    id={name}
    {name}
    class="square-4.5 border border-gray-30 rounded cursor-pointer bg-gray-30 appearance-none transition checked:(border-none bg-brand-50) checked:after:(square-4 i-lc-check text-white content-empty) enabled:(aria-[invalid]:border-red-50 hover:border-gray-40!)"
    type="checkbox"
    bind:checked
    {...$$restProps}
  />
  <span class="text-gray-90 cursor-pointer">
    <slot />
  </span>
</label>
