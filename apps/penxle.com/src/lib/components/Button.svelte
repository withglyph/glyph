<script generics="T extends 'button' | 'submit' | 'link' = 'button'" lang="ts">
  import { RingSpinner } from '$lib/components/spinners';
  import { getFormContext } from '$lib/form';
  import { css, cva } from '$styled-system/css';
  import { center } from '$styled-system/patterns';
  import type { RecipeVariant, RecipeVariantProps } from '$styled-system/css';
  import type { SystemStyleObject } from '$styled-system/types';

  type $$Props = RecipeVariantProps<typeof recipe> & {
    'type'?: T;
    'style'?: SystemStyleObject;
    'loading'?: boolean;
    'form'?: string;
    'aria-hidden'?: boolean;
  } & (T extends 'link' ? { href: string; external?: boolean } : unknown) &
    (T extends 'button' ? { 'aria-pressed'?: boolean } : unknown);

  type $$Events = T extends 'link' ? unknown : { click: MouseEvent };

  export let type: 'button' | 'submit' | 'link' = 'button';

  export let style: SystemStyleObject | undefined = undefined;

  export let disabled: Variants['disabled'] = false;
  export let loading = false;
  export let color: Variants['color'] = 'primary';
  export let variant: Variants['variant'] = 'contained';
  export let size: Variants['size'] = 'md';

  export let form: string | undefined = undefined;

  export let href: string | undefined = undefined;
  export let external = !href?.startsWith('/');

  let element: 'a' | 'button';
  $: element = type === 'link' ? 'a' : 'button';
  $: props =
    type === 'link'
      ? { href: disabled || showSpinner ? undefined : href }
      : { type, disabled: disabled || showSpinner, form };

  const { isSubmitting } = getFormContext().form ?? {};

  $: showSpinner = !!(loading || (type === 'submit' && $isSubmitting));

  type Variants = RecipeVariant<typeof recipe>;
  const recipe = cva({
    base: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      paddingX: '16px',
      paddingY: '8px',
      textAlign: 'center',
      textWrap: 'nowrap',
      fontSize: '13px',
      fontWeight: 'bold',
      lineHeight: 'none',
      transition: 'common',
    },
    variants: {
      color: { primary: {}, secondary: {}, tertiary: {}, red: {} },
      variant: { text: {}, outlined: {}, contained: {} },
      size: {
        xs: { paddingX: '0', paddingY: '0', height: '23px', borderRadius: '16px' },
        sm: { padding: '8px', height: '26px', borderRadius: '8px' },
        md: { fontSize: '14px', height: '36px', borderRadius: '10px' },
        lg: { fontSize: '16px', height: '40px', borderRadius: '12px' },
        xl: { fontSize: '16px', height: '50px', borderRadius: '16px' },
      },
      disabled: {
        true: { color: 'gray.400', backgroundColor: 'gray.300' },
      },
    },
    compoundVariants: [
      {
        variant: 'contained',
        disabled: true,
        css: { borderWidth: '1px', borderColor: 'transparent' },
      },
      {
        variant: 'outlined',
        disabled: true,
        css: { color: 'gray.400', borderColor: 'gray.300', backgroundColor: 'transparent' },
      },
      {
        variant: 'text',
        disabled: false,
        css: { color: 'gray.900', backgroundColor: 'transparent', _hover: { color: 'gray.800' } },
      },
      {
        variant: 'contained',
        color: 'primary',
        disabled: false,
        css: {
          color: 'red.50',
          backgroundColor: 'gray.800',
          borderWidth: '1px',
          borderColor: 'gray.800',
          _hover: { borderColor: 'gray.950', backgroundColor: 'gray.950' },
          _active: { backgroundColor: 'black' },
        },
      },
      {
        variant: 'contained',
        color: 'secondary',
        disabled: false,
        css: {
          color: 'gray.900',
          backgroundColor: 'gray.100',
          borderWidth: '1px',
          borderColor: 'gray.100',
          _hover: { borderColor: 'gray.200', backgroundColor: 'gray.200' },
          _active: { borderColor: 'gray.200', backgroundColor: 'gray.200' },
        },
      },
      {
        variant: 'contained',
        color: 'red',
        disabled: false,
        css: {
          borderColor: 'red.500',
          color: 'red.50',
          backgroundColor: 'red.500',
          _hover: { borderColor: '[#F66062]', backgroundColor: '[#F66062]' },
        },
      },
      {
        variant: 'outlined',
        color: 'tertiary',
        disabled: false,
        css: {
          borderWidth: '1px',
          borderColor: 'gray.200',
          color: 'gray.900',
          backgroundColor: 'transparent',
          _hover: { borderColor: 'gray.400' },
          _active: { borderColor: 'gray.900', backgroundColor: 'gray.50' },
        },
      },
    ],
  });

  $: _style = recipe.raw({ variant, size, color, disabled });
</script>

<svelte:element
  this={element}
  class={css(_style, showSpinner && { position: 'relative' }, style)}
  role="button"
  tabindex="0"
  on:click
  {...external && {
    target: '_blank',
    rel: 'noopener noreferrer',
  }}
  {...props}
  {...$$restProps}
>
  {#if showSpinner}
    <div class={center({ position: 'absolute', inset: '0', paddingX: '16px', paddingY: '8px' })}>
      <RingSpinner style={css.raw({ height: 'full' })} />
    </div>
  {/if}
  <div class={css({ display: 'contents' }, showSpinner && { visibility: 'hidden' })}>
    <slot />
  </div>
</svelte:element>
