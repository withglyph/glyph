<script lang="ts">
  import IconAlertTriangle from '~icons/tabler/alert-triangle';
  import { Icon } from '$lib/components';
  import { getFormContext } from '$lib/form';
  import { clamp } from '$lib/utils';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import FormValidationMessage from './FormValidationMessage.svelte';
  import type { PointerEventHandler } from 'svelte/elements';
  import type { SystemStyleObject } from '$styled-system/types';

  export let min = 0;
  export let max = 1;
  export let value = min;
  export let name: string | undefined = undefined;
  export let style: SystemStyleObject | undefined = undefined;

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

<div class={css({ position: 'relative', display: 'flex', alignItems: 'center', height: '16px' }, style)}>
  <div
    class={css({ borderRadius: 'full', width: 'full', height: '8px', backgroundColor: 'gray.200', overflow: 'hidden' })}
    on:pointerdown={handler}
  >
    <div style:width={p} class={css({ height: 'full', backgroundColor: 'black' })} />
  </div>
  <div class={css({ position: 'absolute', width: 'full', height: '8px', pointerEvents: 'none' })}>
    <button
      style:left={p}
      class={css({
        position: 'absolute',
        top: '[50%]',
        borderRadius: 'full',
        size: '16px',
        backgroundColor: 'gray.500',
        translate: 'auto',
        translateX: '[-50%]',
        translateY: '[-50%]',
        pointerEvents: 'auto',
        touchAction: 'none',
      })}
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
    <div class={flex({ align: 'center', gap: '6px', marginTop: '6px', fontSize: '12px', color: 'red.500' })}>
      <Icon icon={IconAlertTriangle} />
      {message}
    </div>
  </FormValidationMessage>
{/if}
