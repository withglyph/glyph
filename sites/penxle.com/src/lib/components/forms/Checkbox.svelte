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

<label class="flex select-none items-center gap-2">
  <input
    id={name}
    {name}
    class="relative checked:after:(square-4 i-lc-check text-white content-empty) square-5 flex appearance-none center border rounded transition checked:(border-none bg-brand-50) enabled:(aria-[invalid]:border-red-50 hover:border-gray-30)"
    type="checkbox"
    bind:checked
    {...$$restProps}
  />
  <span class={clsx('text-sm text-gray-50', _class)}>
    <slot />
  </span>
</label>
