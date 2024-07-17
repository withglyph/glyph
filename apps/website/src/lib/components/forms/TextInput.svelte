<script lang="ts">
  import { getFormContext } from '$lib/form';
  import { css, cva, cx } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import type { RecipeVariant, RecipeVariantProps, SystemStyleObject } from '$styled-system/types';

  export let name: HTMLInputAttributes['name'] = undefined;
  export let value: HTMLInputAttributes['value'] = undefined;
  export let style: SystemStyleObject | undefined = undefined;
  export let size: Variants['size'] = 'lg';
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
      'borderColor': 'gray.50',
      'fontWeight': 'medium',
      'transition': 'common',
      '&:has(input:enabled)': {
        borderColor: { base: 'gray.100', _hover: 'gray.100', _focusWithin: 'gray.400' },
        backgroundColor: { _hover: 'gray.100', _focusWithin: 'gray.0' },
      },
      '&:has(input:disabled)': {
        color: 'gray.300',
        backgroundColor: 'gray.100',
        borderColor: 'gray.200',
      },
      '&:has(input[aria-invalid])': {
        borderColor: '[red.600!]',
        color: 'red.600',
        _placeholder: { color: 'red.600' },
      },
    },
    variants: {
      size: {
        sm: {
          paddingX: '12px',
          paddingY: '10px',
          fontSize: '13px',
          height: '37px',
        },
        md: {
          paddingX: '14px',
          paddingY: '12px',
          fontSize: '14px',
          height: '44px',
        },
        lg: {
          padding: '14px',
          fontSize: '14px',
          height: '48px',
        },
      },
    },
  });
</script>

<label class={cx(recipe({ size }), css(style))} for={name} {hidden}>
  {#if 'left-icon' in $$slots}
    <div class={flex({ align: 'center', marginRight: '4px' })}>
      <slot name="left-icon" />
    </div>
  {/if}

  <input
    bind:this={inputEl}
    id={name}
    {name}
    class={css({ flexGrow: '1', width: 'full', minWidth: '0' })}
    type="text"
    on:input
    on:keydown
    on:blur
    bind:value
    {...$$restProps}
  />

  {#if 'right-icon' in $$slots}
    <div class={flex({ align: 'center', marginLeft: '4px' })}>
      <slot name="right-icon" />
    </div>
  {/if}
</label>
