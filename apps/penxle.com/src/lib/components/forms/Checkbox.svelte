<script lang="ts">
  import { clsx } from 'clsx';
  import { getFormContext } from '$lib/form';
  import FormValidationMessage from './FormValidationMessage.svelte';

  export let name: string | undefined = undefined;
  export let checked = false;
  let _class: string | undefined = undefined;
  export { _class as class };

  const { field } = getFormContext();

  if (field) {
    name = field.name;
  }
</script>

<label class={clsx('flex items-center gap-1.5 select-none', _class)}>
  <input
    id={name}
    {name}
    class="relative flex center square-4.5 border border-gray-30 rounded cursor-pointer bg-gray-30 appearance-none transition checked:(border-none bg-gray-90) checked:after:(square-4 i-lc-check text-white content-empty) enabled:(aria-[invalid]:border-red-50 hover:border-gray-40!)"
    type="checkbox"
    on:change
    bind:checked
    {...$$restProps}
  />
  <span class="text-gray-90 cursor-pointer">
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
