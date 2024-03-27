<script generics="T extends 'button' | 'submit' | 'link' = 'button'" lang="ts">
  import { RingSpinner } from '$lib/components/spinners';
  import { getFormContext } from '$lib/form';
  import { css, cva } from '$styled-system/css';
  import { center } from '$styled-system/patterns';
  import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
  import type { RecipeVariant, RecipeVariantProps } from '$styled-system/css';
  import type { SystemStyleObject } from '$styled-system/types';

  type $$Props = RecipeVariantProps<typeof recipe> & {
    type?: T;
    loading?: boolean;
    style?: SystemStyleObject;
  } & Omit<
      T extends 'link' ? HTMLAnchorAttributes & { external?: boolean } : Omit<HTMLButtonAttributes, 'type'>,
      'class' | 'style'
    >;

  type $$Events = T extends 'link' ? unknown : { click: MouseEvent };

  export let type: 'button' | 'submit' | 'link' = 'button';

  export let style: SystemStyleObject | undefined;

  export let loading = false;
  export let variant: Variants['variant'] = 'gray-primary-fill';
  export let size: Variants['size'] = 'md';

  export let external = false;

  $: element = type === 'link' ? 'a' : 'button';

  const { isSubmitting } = getFormContext().form ?? {};

  $: showSpinner = !!(loading || (type === 'submit' && $isSubmitting));
  $: props =
    type === 'link'
      ? { href: showSpinner ? undefined : $$restProps.href }
      : { disabled: $$restProps.disabled || showSpinner };

  type Variants = RecipeVariant<typeof recipe>;
  const recipe = cva({
    base: {
      textAlign: 'center',
      outlineOffset: '0',
      userSelect: 'none',
      color: { _enabled: 'gray.5', _disabled: 'gray.400' },
      backgroundColor: { _disabled: 'gray.150' },
    },
    variants: {
      variant: {
        'gray-primary-fill': {
          _enabled: {
            backgroundColor: {
              base: 'gray.900',
              _hover: 'gray.800',
              _focusVisible: 'gray.800',
              _active: 'gray.900',
              _pressed: 'gray.900',
            },
            outlineWidth: { _active: '2px', _pressed: '2px' },
            outlineColor: { _active: 'gray.400', _pressed: 'gray.400' },
          },
        },
        'gray-sub-fill': {
          _enabled: {
            color: 'gray.900',
            backgroundColor: {
              base: 'gray.50',
              _hover: 'gray.100',
              _focusVisible: 'gray.100',
              _active: 'gray.50',
              _pressed: 'gray.50',
            },
            outlineWidth: { _active: '2px', _pressed: '2px' },
            outlineColor: { _active: 'gray.200', _pressed: 'gray.200' },
          },
        },
        'cyan-fill': {
          _enabled: {
            backgroundColor: {
              base: 'cyan.400',
              _hover: 'cyan.600',
              _focusVisible: 'cyan.600',
              _active: 'cyan.400',
              _pressed: 'cyan.400',
            },
            outlineWidth: { _active: '2px', _pressed: '2px' },

            outlineColor: { _active: 'cyan.600', _pressed: 'cyan.600' },
          },
        },
        'gradation-fill': {
          _enabled: {
            bgGradient: 'to-r',
            gradientFrom: {
              base: '[#34186B]',
              _hover: '[#2F2058]',
              _focusVisible: '[#2F2058]',
              _active: '[#34186B]',
              _pressed: '[#34186B]',
            },
            gradientTo: {
              base: '[#27A6BA]',
              _hover: '[#207383]',
              _focusVisible: '[#207383]',
              _active: '[#27A6BA]',
              _pressed: '[#27A6BA]',
            },
            outlineWidth: { _active: '2px', _pressed: '2px' },
            outlineColor: { _active: 'cyan.400', _pressed: 'cyan.400' },
          },
        },
        'gray-outline': {
          _enabled: {
            color: 'gray.900',
            backgroundColor: { _hover: 'gray.100', _focusVisible: 'gray.100', _active: 'gray.5', _pressed: 'gray.5' },
            outlineWidth: { base: '1px', _active: '3px', _pressed: '3px' },
            outlineColor: 'gray.200',
          },
        },
        'gray-text': {
          _enabled: {
            color: 'gray.900',
            backgroundColor: { _hover: 'gray.50', _focusVisible: 'gray.50', _active: 'gray.5', _pressed: 'gray.5' },
            outlineWidth: { base: '1px', _active: '2px', _pressed: '2px' },
            outlineColor: 'gray.200',
          },
        },
        'red-text': {
          _enabled: {
            color: 'red.600',
            backgroundColor: { _hover: 'red.50', _focusVisible: 'red.50', _active: 'gray.5', _pressed: 'gray.5' },
            outlineWidth: { _active: '2px', _pressed: '2px' },
            outlineColor: 'red.600',
          },
        },
        'red-fill': {
          _enabled: {
            backgroundColor: {
              base: 'red.600',
              _active: 'red.600',
              _hover: 'red.800',
              _focusVisible: 'red.600',
              _pressed: 'red.600',
            },
            outlineWidth: { _active: '2px', _pressed: '2px' },
            outlineColor: { _active: 'red.900', _pressed: 'red.900' },
          },
        },
      },
      size: {
        xs: { paddingX: '8px', paddingY: '4px', fontSize: '12px', fontWeight: 'medium' },
        sm: { paddingX: '12px', paddingY: '9px', fontSize: '13px', fontWeight: 'medium' },
        md: { padding: '12px', fontSize: '14px', fotWeight: 'semibold' },
        lg: { paddingX: '16px', paddingY: '14px', fontSize: '14px', fontWeight: 'semibold' },
      },
    },
  });
</script>

<svelte:element
  this={element}
  class={css(recipe.raw({ variant, size }), showSpinner && { position: 'relative' }, style)}
  aria-busy={showSpinner}
  role="button"
  tabindex="0"
  on:click
  {...$$restProps}
  {...props}
  {...external && {
    target: '_blank',
    rel: 'noopener noreferrer',
  }}
>
  {#if showSpinner}
    <div class={center({ position: 'absolute', inset: '0', padding: '[inherit]' })}>
      <RingSpinner style={css.raw({ height: 'full', color: variant === 'cyan-fill' ? 'gray.150' : 'gray.400' })} />
    </div>
  {/if}
  <div class={css({ display: 'contents' }, showSpinner && { visibility: 'hidden' })}>
    <slot />
  </div>
</svelte:element>
