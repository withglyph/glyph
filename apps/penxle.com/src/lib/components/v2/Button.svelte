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
  export let variant: Variants['variant'] = 'primary';
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
    base: { textAlign: 'center', outlineOffset: '0' },
    variants: {
      variant: {
        'primary': {
          color: 'white',
          backgroundColor: {
            base: 'gray.950',
            _enabled: {
              _hover: 'gray.800',
              _focusVisible: 'gray.800',
              _pressed: 'gray.800',
            },
            _disabled: 'gray.200',
          },
          boxShadow: { _active: '[0 0 0 2px #A1A1AA]' },
        },
        'secondary': {
          color: 'white',
          backgroundColor: {
            base: 'teal.500',
            _enabled: {
              _hover: 'teal.400',
              _focusVisible: 'teal.400',
              _pressed: 'teal.400',
            },
            _disabled: 'gray.200',
          },
          boxShadow: { _active: '[0 0 0 2px #99F6E4]' },
        },
        'tertiary': {
          color: { base: 'gray.500', _disabled: 'gray.400' },
          backgroundColor: {
            base: 'gray.100',
            _enabled: {
              _hover: 'gray.50',
              _focusVisible: 'gray.50',
              _pressed: 'gray.50',
            },
            _disabled: 'gray.50',
          },
          boxShadow: { _active: '[0 0 0 2px #E4E4E7]' },
        },
        'outline': {
          color: { base: 'gray.500', _disabled: 'gray.400' },
          outlineWidth: '1px',
          outlineColor: { base: 'gray.150', _active: 'gray.300', _disabled: 'gray.150' },
          backgroundColor: {
            base: 'white',
            _enabled: {
              _hover: 'gray.50',
              _focusVisible: 'gray.50',
              _pressed: 'gray.50',
            },
            _disabled: '[initial]',
          },
          boxShadow: { _active: '[0 0 0 2px #E4E4E7]' },
        },
        'secondary-outline': {
          color: { base: 'teal.500', _disabled: 'gray.400' },
          outlineWidth: '1px',
          outlineColor: { base: 'teal.500', _disabled: 'gray.100' },
          backgroundColor: {
            _enabled: {
              _hover: 'teal.50',
              _focusVisible: 'teal.50',
              _pressed: 'teal.50',
            },
            _disabled: '[initial]',
          },
          boxShadow: { _active: '[0 0 0 2px #99F6E4]' },
        },
      },
      size: {
        '2xs': { paddingX: '14px', paddingY: '5px', fontSize: '11px', fontWeight: 'semibold', borderRadius: '4px' },
        'xs': { paddingX: '14px', paddingY: '8px', fontSize: '11px', fontWeight: 'semibold', borderRadius: '4px' },
        'sm': { paddingX: '14px', paddingY: '8px', fontSize: '12px', fontWeight: 'semibold', borderRadius: '4px' },
        'md': { paddingX: '16px', paddingY: '8px', fontSize: '14px', fontWeight: 'semibold', borderRadius: '5px' },
        'lg': { paddingX: '20px', paddingY: '10px', fontSize: '15px', fontWeight: 'semibold', borderRadius: '6px' },
        'xl': { paddingX: '24px', paddingY: '12px', fontSize: '17px', fontWeight: 'semibold', borderRadius: '7px' },
      },
    },
  });
</script>

<svelte:element
  this={element}
  class={css(recipe.raw({ variant, size }), style)}
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
    <div class={center({ position: 'absolute', inset: '0', paddingX: '16px', paddingY: '8px' })}>
      <RingSpinner
        style={css.raw(
          { height: 'full' },
          (variant === 'outline' || variant === 'secondary-outline') && { color: 'gray.300' },
        )}
      />
    </div>
  {/if}
  <div class={css({ display: 'contents' }, showSpinner && { visibility: 'hidden' })}>
    <slot />
  </div>
</svelte:element>
