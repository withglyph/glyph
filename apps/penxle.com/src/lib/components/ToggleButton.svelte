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
      'borderRadius': '6px',
      'paddingX': '14px',
      'paddingY': '6px',
      'fontSize': '12px',
      'fontWeight': 'medium',
      'color': 'gray.400',
      'whiteSpace': 'nowrap',
      'backgroundColor': 'gray.50',
      'transition': 'common',
      'cursor': 'pointer',
      '_focus': { borderColor: 'teal.500', color: 'teal.700' },
      '&:has(:checked)': {
        borderColor: 'teal.500',
        color: 'teal.700',
        backgroundColor: 'teal.50',
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
