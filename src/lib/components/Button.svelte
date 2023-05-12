<script lang="ts">
  import clsx from 'clsx';
  import { RingSpinner } from '$lib/components/spinners';
  import { getFormContext } from '$lib/form';

  export let type: 'button' | 'submit' = 'button';
  let _class: string | undefined = undefined;
  export { _class as class };
  export let disabled = false;
  export let loading = false;

  const { form } = getFormContext();
  const { isSubmitting } = form ?? {};

  $: showSpinner = !!(loading || (type === 'submit' && $isSubmitting));
</script>

<button
  class={clsx(
    'relative flex center rounded-full px-4 py-2 font-semibold transition duration-300',
    disabled
      ? 'text-gray-500 bg-gray-300 opacity-50'
      : 'text-white bg-brand-500 active:bg-brand-600 hover:bg-brand-500',
    _class
  )}
  disabled={disabled || showSpinner}
  {type}
  on:click
>
  {#if showSpinner}
    <div class="absolute inset-0 flex center px-4 py-2">
      <RingSpinner class="square-full" />
    </div>
  {/if}
  <div class={clsx('contents', showSpinner && 'invisible')}>
    <slot />
  </div>
</button>
