<script lang="ts">
  import { getFormContext } from '$lib/form';

  let errorFor: string;
  export { errorFor as for };
  export let type: 'error' | 'warning' = 'error';

  const { form } = getFormContext();
  if (!form) {
    throw new Error('Validation must be used within a Form');
  }

  $: store = type === 'error' ? form.errors : form.warnings;
  $: message = $store[errorFor]?.[0];
</script>

{#if message}
  <slot {message} />
{/if}
