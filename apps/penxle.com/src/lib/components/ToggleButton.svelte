<script lang="ts">
  import { css } from '$styled-system/css';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import type { SystemStyleObject } from '$styled-system/types';

  type $$Events = {
    change: Event & { currentTarget: HTMLInputElement };
  };

  type $$Props = Omit<HTMLInputAttributes, 'class' | 'style'> & { style?: SystemStyleObject };

  export let checked: $$Props['checked'] = undefined;
  export let style: SystemStyleObject | undefined = undefined;
</script>

<label
  class={css(
    {
      'position': 'relative',
      'display': 'inline-flex',
      'justifyContent': 'center',
      'borderWidth': '1px',
      'borderColor': 'gray.200',
      'paddingX': '12px',
      'paddingY': '7px',
      'fontSize': '14px',
      'fontWeight': 'medium',
      'color': 'gray.500',
      'whiteSpace': 'nowrap',
      'backgroundColor': 'gray.50',
      'transition': 'common',
      'cursor': 'pointer',
      '&:has(:disabled)': { cursor: 'not-allowed' },
      '_focus': { borderColor: 'cyan.400', color: 'gray.5' },
      '&:has(:checked)': {
        borderColor: 'cyan.400',
        color: 'gray.5',
        backgroundColor: 'cyan.400',
      },
    },
    style,
  )}
>
  <input
    class={css({
      position: 'absolute',
      inset: '0',
      size: 'full',
      appearance: 'none',
      visibility: 'hidden',
    })}
    aria-checked={checked}
    type="checkbox"
    on:change
    bind:checked
    {...$$restProps}
  />
  <slot />
</label>
