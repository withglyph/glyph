<script lang="ts">
  import { setFormField } from '$lib/form';
  import FormValidationMessage from './FormValidationMessage.svelte';

  export let name: string;
  export let label: string;
  let _class: string | undefined = undefined;
  export { _class as class };

  setFormField({
    name,
  });
</script>

<section class={_class}>
  <div
    class="flex flex-col gap-1.5 border border-gray-5 rounded-2xl transition bg-primary pt-3 pb-4 px-3.5 hover:border-secondary focus-within:border-tertiary! [&:has(input[aria-invalid])]:border-action-error [&:has(textarea[aria-invalid])]:border-action-error disabled:opacity-50"
  >
    <label class="body-14-sb" for={name}>{label}</label>
    <slot />
  </div>
  <FormValidationMessage for={name} let:message>
    <div class="flex items-center gap-1.5 mt-1.5 text-xs text-red-50">
      <i class="i-lc-alert-triangle" />
      {message}
    </div>
  </FormValidationMessage>
</section>
