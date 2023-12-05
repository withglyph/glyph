<script lang="ts">
  import clsx from 'clsx';
  import { getFormContext } from '$lib/form';
  import type { HTMLInputAttributes } from 'svelte/elements';

  type $$Props = Omit<HTMLInputAttributes, 'type'>;

  let _class: $$Props['class'] = undefined;
  export { _class as class };
  export let name: $$Props['name'] = undefined;

  const { field } = getFormContext();

  if (field) {
    name = field.name;
  }
</script>

<label class={clsx('flex items-center', _class)}>
  <input
    id={name}
    {name}
    class="inline-block square-4.5 cursor-pointer appearance-none relative border border-primary rounded-full checked:border-tertiary checked:before:(absolute block content-[''] square-2.5 rounded-full bg-gray-90 top-50% left-50% -translate-50%)"
    type="radio"
    on:change
    {...$$restProps}
  />
  <slot />
</label>
