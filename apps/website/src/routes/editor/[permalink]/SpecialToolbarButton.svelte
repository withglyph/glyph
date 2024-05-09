<script lang="ts">
  import { Icon } from '$lib/components';
  import { css, cva } from '$styled-system/css';
  import type { ComponentType } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import type { RecipeVariant, RecipeVariantProps, SystemStyleObject } from '$styled-system/types';

  type $$Props = {
    icon: ComponentType;
    label?: string;
    style?: SystemStyleObject;
  } & HTMLButtonAttributes &
    RecipeVariantProps<typeof recipe>;

  export let external = false;
  export let icon: ComponentType;
  export let style: SystemStyleObject | undefined = undefined;

  export let label: string | undefined = undefined;
  export let variant: Variants['variant'] = 'fill';

  type Variants = RecipeVariant<typeof recipe>;
  const recipe = cva({
    base: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '2px',
      margin: '2px',
      fontSize: '12px',
      fontWeight: 'medium',
      color: 'gray.600',
      height: '20px',
      transition: 'common',
      _hover: { backgroundColor: 'brand.200' },
    },
    variants: {
      variant: {
        fill: { _pressed: { backgroundColor: { base: 'brand.400', _hover: 'brand.600!' }, color: 'gray.50' } },
        outline: {
          _pressed: {
            borderWidth: '1px',
            borderColor: 'brand.400',
            backgroundColor: { base: 'brand.200', _hover: '[#B098FF!]' },
          },
        },
      },
    },
  });

  $: _style = recipe.raw({ variant });
</script>

<button
  class={css(_style, style)}
  type="button"
  on:click
  {...$$restProps}
  {...external && {
    target: '_blank',
    rel: 'noopener noreferrer',
  }}
>
  <Icon {icon} size={20} />
  {#if label}
    <span class={css({ paddingRight: '2px' })}>{label}</span>
  {/if}
</button>
