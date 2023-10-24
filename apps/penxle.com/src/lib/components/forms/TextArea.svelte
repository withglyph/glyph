<script lang="ts">
  import { clsx } from 'clsx';
  import { getFormContext } from '$lib/form';
  import type { HTMLTextareaAttributes } from 'svelte/elements';

  export let name: HTMLTextareaAttributes['name'] = undefined;
  export let value: HTMLTextareaAttributes['value'] = undefined;
  let _class: HTMLTextareaAttributes['class'] = undefined;
  export { _class as class };

  type $$Props = HTMLTextareaAttributes;

  const { field } = getFormContext();

  if (field) {
    name = field.name;
  }
</script>

<div class="relative flex items-center">
  <textarea
    id={name}
    {name}
    class={clsx('body-15-m resize-none', _class, 'right-icon' in $$slots && 'mb-4')}
    on:input
    bind:value
    {...$$restProps}
  />
  {#if 'right-icon' in $$slots}
    <div class="absolute right-0 bottom-0 flex center">
      <slot name="right-icon" />
    </div>
  {/if}
</div>
