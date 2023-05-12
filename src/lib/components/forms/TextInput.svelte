<script lang="ts">
  import clsx from 'clsx';
  import { getFormField } from './context';
  import type { HTMLInputAttributes } from 'svelte/elements';

  export let name: HTMLInputAttributes['name'] = undefined;
  export let value: HTMLInputAttributes['value'] = undefined;
  let _class: HTMLInputAttributes['class'] = undefined;
  export { _class as class };

  type $$Props = HTMLInputAttributes;

  const field = getFormField();
  if (field) {
    name = field.name;
  }
</script>

<div class="relative">
  {#if 'left-icon' in $$slots}
    <div class="absolute inset-y-0 left-4 flex center">
      <slot name="left-icon" />
    </div>
  {/if}
  <input
    id={name}
    {name}
    class={clsx(
      'rounded px-4 py-2 border transition hover:border-gray-300 focus:border-brand-300',
      _class,
      'left-icon' in $$slots && 'pl-10',
      'right-icon' in $$slots && 'pr-10'
    )}
    type="text"
    bind:value
    {...$$restProps}
  />
  {#if 'right-icon' in $$slots}
    <div class="absolute inset-y-0 right-4 flex center">
      <slot name="right-icon" />
    </div>
  {/if}
</div>
