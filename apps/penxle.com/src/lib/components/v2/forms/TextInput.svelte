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
  type $$Events = {
    input: Event & { currentTarget: HTMLInputElement };
    keydown: KeyboardEvent & { currentTarget: HTMLInputElement };
  };

  const { field } = getFormContext();

  if (field) {
    name = field.name;
  }
</script>

<div class={flex({ align: 'center', position: 'relative' })}>
  <input
    id={name}
    {name}
    class={css(
      {
        borderWidth: '1px',
        borderColor: { base: 'gray.150', _hover: 'gray.400', _focus: 'gray.400' },
        borderRadius: '8px',
        paddingX: '16px',
        paddingY: '12px',
        width: 'full',
        backgroundColor: { base: 'gray.5', _disabled: 'gray.100' },
        _invalid: {
          backgroundColor: 'red.50',
          borderColor: '[red.600!]',
          color: 'red.600',
          _placeholder: { color: 'red.600' },
        },
      },
      style,
      'right-icon' in $$slots && { paddingRight: '50px' },
    )}
    type="text"
    on:input
    on:keydown
    bind:value
    {...$$restProps}
  />
  {#if 'right-icon' in $$slots}
    <div class={center({ position: 'absolute', right: '12px', insetY: '0' })}>
      <slot name="right-icon" />
    </div>
  {/if}
</div>
