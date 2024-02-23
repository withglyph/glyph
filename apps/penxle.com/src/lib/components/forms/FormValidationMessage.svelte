<script lang="ts">
  import { getFormContext } from '$lib/form';
  import type { Writable } from 'svelte/store';

  let errorFor: string;
  export { errorFor as for };
  export let type: 'error' | 'warning' = 'error';

  const { form } = getFormContext();
  if (!form) {
    throw new Error('Validation must be used within a Form');
  }
  const isSubmitting: Writable<boolean> = form.isSubmitting;

  let isSubmitted = false;

  $: if ($isSubmitting && !isSubmitted) {
    isSubmitted = true;
  }

  $: store = type === 'error' ? form.errors : form.warnings;
  $: message = isSubmitted && $store[errorFor]?.[0];
</script>

{#if message}
  <slot {message} />
{/if}
