<script lang="ts">
  import { getValue } from 'felte';
  import { getFormContext } from '$lib/form';

  let errorFor: string;
  export { errorFor as for };
  export let type: 'error' | 'warning' = 'error';

  const { form } = getFormContext();
  if (!form) {
    throw new Error('Validation must be used within a Form');
  }

  $: store = type === 'error' ? form.errors : form.warnings;
  $: message = getValue($store, errorFor);
</script>

{#if typeof message === 'string'}
  <slot {message} />
{/if}
