<script lang="ts">
  import { getFormContext } from '$lib/form';
  import { css } from '$styled-system/css';
  import type { HTMLTextareaAttributes } from 'svelte/elements';
  import type { SystemStyleObject } from '$styled-system/types';

  export let name: HTMLTextareaAttributes['name'] = undefined;
  export let value: HTMLTextareaAttributes['value'] = undefined;
  export let style: SystemStyleObject | undefined = undefined;
  export let textareaEl: HTMLTextAreaElement | undefined = undefined;

  type $$Props = Omit<HTMLTextareaAttributes, 'class' | 'style' | 'size'> & {
    style?: SystemStyleObject;
    textareaEl?: HTMLTextAreaElement;
  };
  type $$Events = {
    input: Event & { currentTarget: HTMLTextAreaElement };
    keydown: KeyboardEvent & { currentTarget: HTMLTextAreaElement };
    blur: FocusEvent & { currentTarget: HTMLTextAreaElement };
  };

  const { field } = getFormContext();

  if (field) {
    name = field.name;
  }
</script>

<label
  class={css(
    {
      'display': 'flex',
      'flexDirection': 'column',
      'borderWidth': '1px',
      'borderColor': 'gray.50',
      'paddingX': '12px',
      'paddingY': '10px',
      'fontSize': '14px',
      'fontWeight': 'medium',
      'transition': 'common',
      '&:has(textarea:enabled)': {
        borderColor: { base: 'gray.100', _hover: 'gray.100', _focusWithin: 'gray.400' },
        backgroundColor: { _hover: 'gray.100', _focusWithin: 'gray.0' },
      },
      '&:has(textarea:disabled)': {
        color: 'gray.300',
        backgroundColor: 'gray.100',
        borderColor: 'gray.200',
      },
      '&:has(textarea[aria-invalid])': {
        borderColor: '[red.600!]',
        color: 'red.600',
        _placeholder: { color: 'red.600' },
      },
    },
    style,
  )}
>
  <textarea
    bind:this={textareaEl}
    id={name}
    {name}
    class={css({ flexGrow: '1', width: 'full', minWidth: '0', resize: 'none' })}
    on:input
    on:keydown
    on:blur
    bind:value
    {...$$restProps}
  />

  {#if 'right-icon' in $$slots}
    <slot name="right-icon" />
  {/if}
</label>
