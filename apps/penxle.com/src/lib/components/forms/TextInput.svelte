<script lang="ts">
  import { clsx } from 'clsx';
  import { getFormContext } from '$lib/form';
  import type { HTMLInputAttributes } from 'svelte/elements';

  export let name: HTMLInputAttributes['name'] = undefined;
  export let value: HTMLInputAttributes['value'] = undefined;
  let _class: HTMLInputAttributes['class'] = undefined;
  export { _class as class };

  type $$Props = HTMLInputAttributes;
  type $$Events = {
    input: Event & { currentTarget: HTMLInputElement };
  };

  const { field } = getFormContext();

  if (field) {
    name = field.name;
  }
</script>

<div class="relative flex items-center">
  {#if 'left-icon' in $$slots}
    <div class="absolute inset-y-0 left-4 flex center">
      <slot name="left-icon" />
    </div>
  {/if}
  {#if 'left-text' in $$slots}
    <div class="body-15-m">
      <slot name="left-text" />
    </div>
  {/if}
  <input
    id={name}
    {name}
    class={clsx(
      'body-15-m w-full',
      _class,
      'left-icon' in $$slots && 'pl-10',
      'right-label' in $$slots && 'pr-20',
      'right-icon' in $$slots && 'pr-10',
      'left-text' in $$slots ? 'rounded-r' : 'rounded',
    )}
    type="text"
    on:input
    bind:value
    {...$$restProps}
  />
  {#if 'right-label' in $$slots}
    <div class={clsx('absolute inset-y-0 right-0 flex center', 'right-icon' in $$slots && 'right-6')}>
      <slot name="right-label" />
    </div>
  {/if}
  {#if 'right-icon' in $$slots}
    <div class="absolute inset-y-0 right-0 flex center">
      <slot name="right-icon" />
    </div>
  {/if}
</div>
