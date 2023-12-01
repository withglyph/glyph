<script lang="ts">
  import { clsx } from 'clsx';
  import { getFormContext } from '$lib/form';
  import { clamp } from '$lib/utils';
  import FormValidationMessage from './FormValidationMessage.svelte';
  import type { PointerEventHandler } from 'svelte/elements';

  export let min = 0;
  export let max = 1;
  export let value = min;
  export let name: string | undefined = undefined;
  let _class: string | undefined = undefined;
  export { _class as class };

  const { field } = getFormContext();

  $: p = `${((value - min) / (max - min)) * 100}%`;

  const handler: PointerEventHandler<HTMLElement> = (e) => {
    if (!e.currentTarget.parentElement) {
      return;
    }

    const { left: parentLeft, width: parentWidth } = e.currentTarget.parentElement.getBoundingClientRect();
    const { clientX: pointerLeft } = e;
    value = clamp(((pointerLeft - parentLeft) / parentWidth) * (max - min) + min, min, max);
  };

  if (field) {
    name = field.name;
  }
</script>

<div class={clsx('relative flex items-center h-4', _class)}>
  <div class="w-full h-2 bg-gray-20 rounded-full overflow-hidden" on:pointerdown={handler}>
    <div style:width={p} class="bg-black h-full" />
  </div>
  <div class="absolute h-2 w-full pointer-events-none">
    <button
      style:left={p}
      class="absolute square-4 bg-gray-50 rounded-full top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-auto touch-none"
      type="button"
      on:dragstart|preventDefault
      on:pointerdown={(e) => e.currentTarget.setPointerCapture(e.pointerId)}
      on:pointermove|preventDefault={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          handler(e);
        }
      }}
    />
  </div>
</div>

{#if name}
  <FormValidationMessage for={name} let:message>
    <div class="flex items-center gap-1.5 mt-1.5 text-xs text-red-50">
      <i class="i-lc-alert-triangle" />
      {message}
    </div>
  </FormValidationMessage>
{/if}
