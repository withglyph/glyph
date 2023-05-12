<script lang="ts">
  import { FormValidationMessage } from '$lib/form';
  import { setFormField } from './context';

  export let name: string;
  export let label: string;

  setFormField({
    name,
  });
</script>

<section>
  <div class="mb-1 flex justify-between">
    <label class="text-sm font-medium" for={name}>{label}</label>
    <FormValidationMessage for={name} let:message>
      <div class="flex items-center gap-1 text-xs font-semibold text-red-500">
        <span class="i-lc-alert-triangle" />
        {message}
      </div>
    </FormValidationMessage>
  </div>
  <slot />
</section>
