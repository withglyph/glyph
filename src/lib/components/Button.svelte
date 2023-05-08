<script lang="ts">
  import clsx from 'clsx';
  import { debounce } from 'radash';
  import { RingSpinner } from '$lib/components/spinners';
  import { getForm } from '$lib/form';

  export let type: 'button' | 'submit' = 'button';
  let _class: string | undefined = undefined;
  export { _class as class };
  export let disabled = false;
  export let loading = false;

  let showSpinner = false;

  const form = getForm();
  const { isValid, isSubmitting } = form ?? {};

  $: if (
    type === 'submit' &&
    $isValid !== undefined &&
    $isSubmitting !== undefined
  ) {
    disabled = !$isValid;
    loading = $isSubmitting;
  }

  const hideSpinner = debounce({ delay: 200 }, () => (showSpinner = false));

  $: if (loading) {
    showSpinner = true;
  } else {
    hideSpinner();
  }
</script>

<button
  class={clsx(
    'relative flex center rounded-full px-4 py-2 font-semibold transition duration-300 enabled:(text-white bg-brand-500 active:bg-brand-600 hover:bg-brand-500) disabled:(text-gray-500 bg-gray-300 opacity-50)',
    _class
  )}
  disabled={disabled || showSpinner}
  {type}
  on:click
>
  {#if showSpinner}
    <div class="absolute inset-0 flex center px-2 py-1">
      <RingSpinner class="square-full" />
    </div>
  {/if}
  <div class={clsx('contents', showSpinner && 'invisible')}>
    <slot />
  </div>
</button>
