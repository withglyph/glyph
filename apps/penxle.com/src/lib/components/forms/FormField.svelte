<script lang="ts">
  import { setFormField } from '$lib/form';
  import FormValidationMessage from './FormValidationMessage.svelte';

  export let name: string;
  export let label: string;
  export let _class: string;
  export { _class as class };

  setFormField({
    name,
  });
</script>

<section class={_class}>
  <div
    class="flex flex-col gap-1 border border-gray-10 rounded-2xl transition bg-gray-10 pt-3 pb-4 px-3.5 hover:border-gray-30 focus-within:border-gray-90 [&:has(input[aria-invalid])]:border-red-50 disabled:opacity-50"
  >
    <label for={name} class="text-3.25 font-bold">{label}</label>
    <slot />
  </div>
  <FormValidationMessage for={name} let:message>
    <div class="flex items-center gap-1.5 mt-1.5 text-xs text-red-50">
      <span class="i-lc-alert-triangle" />
      {message}
    </div>
  </FormValidationMessage>
</section>
