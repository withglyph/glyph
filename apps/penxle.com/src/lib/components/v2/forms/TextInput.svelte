<script lang="ts">
  import { getFormContext } from '$lib/form';
  import { css, cva, cx } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import type { RecipeVariant, RecipeVariantProps, SystemStyleObject } from '$styled-system/types';

  export let name: HTMLInputAttributes['name'] = undefined;
  export let value: HTMLInputAttributes['value'] = undefined;
  export let style: SystemStyleObject | undefined = undefined;
  export let size: Variants['size'] = 'md';
  export let inputEl: HTMLInputElement | undefined = undefined;
  export let hidden = false;

  type $$Props = RecipeVariantProps<typeof recipe> &
    Omit<HTMLInputAttributes, 'class' | 'style' | 'size'> & { style?: SystemStyleObject; inputEl?: HTMLInputElement };
  type $$Events = {
    input: Event & { currentTarget: HTMLInputElement };
    keydown: KeyboardEvent & { currentTarget: HTMLInputElement };
    blur: FocusEvent & { currentTarget: HTMLInputElement };
  };

  const { field } = getFormContext();

  if (field) {
    name = field.name;
  }

  type Variants = RecipeVariant<typeof recipe>;
  const recipe = cva({
    base: {
      'display': 'flex',
      'alignItems': 'center',
      'borderWidth': '1px',
      'borderColor': { base: 'gray.50', _enabled: { _hover: 'gray.100', _focus: 'gray.400' } },
      'fontSize': '16px',
      'fontWeight': 'medium',
      'backgroundColor': {
        base: 'gray.50',
        _enabled: { _hover: 'gray.100', _focus: 'gray.5' },
        _disabled: 'gray.100',
      },
      'transition': 'common',
      '_disabled': {
        color: 'gray.400',
        _placeholder: { color: 'gray.400' },
      },
      '&:has(input[aria-invalid])': {
        borderColor: '[red.600!]',
        color: 'red.600',
        _placeholder: { color: 'red.600' },
      },
    },
    variants: {
      size: {
        xs: {
          paddingX: '12px',
          paddingY: '8px',
          fontSize: '14px',
          height: '34px',
        },
        sm: {
          paddingX: '12px',
          paddingY: '10px',
          fontSize: '14px',
          height: '44px',
        },
        md: {
          padding: '14px',
          height: '48px',
        },
        lg: {
          padding: '14px',
          height: '52px',
        },
      },
    },
  });
</script>

<div class={cx(recipe({ size }), css(style))} {hidden}>
  {#if 'left-icon' in $$slots}
    <label class={flex({ align: 'center', marginRight: '6px' })} for={name}>
      <slot name="left-icon" />
    </label>
  {/if}

  <input
    bind:this={inputEl}
    id={name}
    {name}
    class={css({ flexGrow: '1' })}
    type="text"
    on:input
    on:keydown
    on:blur
    bind:value
    {...$$restProps}
  />

  {#if 'right-icon' in $$slots}
    <label class={flex({ align: 'center', marginLeft: '6px' })} for={name}>
      <slot name="right-icon" />
    </label>
  {/if}
</div>
