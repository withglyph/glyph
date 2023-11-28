<script lang="ts">
  import { clsx } from 'clsx';
  import { getFormContext } from '$lib/form';
  import FormValidationMessage from './FormValidationMessage.svelte';
  import type { HTMLInputAttributes } from 'svelte/elements';

  export let name: string | null | undefined = undefined;
  export let checked: boolean | null | undefined = false;
  let _class: string | null | undefined = undefined;
  export { _class as class };

  type $$Props = HTMLInputAttributes;

  const { field } = getFormContext();

  if (field) {
    name = field.name;
  }
</script>

<div>
  <label class={clsx('flex items-center gap-1.5 select-none', _class)}>
    <input
      id={name}
      {name}
      class="relative flex center square-4.5 shrink-0 border border-gray-30 rounded cursor-pointer appearance-none transition checked:(border-none bg-gray-90) checked:after:(square-4 i-lc-check text-white content-empty) enabled:(aria-[invalid]:border-red-50 hover:border-gray-40!)"
      type="checkbox"
      on:change
      bind:checked
      {...$$restProps}
    />
    <span class="slot text-gray-90 cursor-pointer">
      <slot />
    </span>
  </label>
  {#if name}
    <FormValidationMessage for={name} let:message>
      <div class="flex items-center gap-1.5 mt-1.5 text-xs text-red-50">
        <span class="i-lc-alert-triangle" />
        {message}
      </div>
    </FormValidationMessage>
  {/if}
</div>
