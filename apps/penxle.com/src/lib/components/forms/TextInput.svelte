<script lang="ts">
  import { getFormContext } from '$lib/form';
  import { css } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import type { SystemStyleObject } from '$styled-system/types';

  export let name: HTMLInputAttributes['name'] = undefined;
  export let value: HTMLInputAttributes['value'] = undefined;
  export let style: SystemStyleObject | undefined = undefined;

  type $$Props = Omit<HTMLInputAttributes, 'class' | 'style'> & { style?: SystemStyleObject };
  type $$Events = { input: Event & { currentTarget: HTMLInputElement } };

  const { field } = getFormContext();

  if (field) {
    name = field.name;
  }
</script>

<div class={flex({ align: 'center', position: 'relative' })}>
  {#if 'left-icon' in $$slots}
    <div class={center({ position: 'absolute', left: '16px', insetY: '0' })}>
      <slot name="left-icon" />
    </div>
  {/if}
  {#if 'left-text' in $$slots}
    <div class={css({ fontSize: '15px', fontWeight: 'medium' })}>
      <slot name="left-text" />
    </div>
  {/if}
  <input
    id={name}
    {name}
    class={css(
      { width: 'full', fontSize: '15px', fontWeight: 'medium', backgroundColor: 'transparent' },
      style,
      'left-icon' in $$slots && { paddingLeft: '40px' },
      'right-label' in $$slots && { paddingRight: '80px' },
      'right-icon' in $$slots && { paddingRight: '40px' },
      'left-text' in $$slots ? { borderRightRadius: '4px' } : { borderRadius: '4px' },
    )}
    type="text"
    on:input
    bind:value
    {...$$restProps}
  />
  {#if 'right-label' in $$slots}
    <div
      class={css(
        center.raw({ position: 'absolute', right: '0', insetY: '0' }),
        'right-icon' in $$slots && { right: '24px' },
      )}
    >
      <slot name="right-label" />
    </div>
  {/if}
  {#if 'right-icon' in $$slots}
    <div class={center({ position: 'absolute', right: '0', insetY: '0' })}>
      <slot name="right-icon" />
    </div>
  {/if}
</div>
