<script lang="ts">
  import { css, cva } from '$styled-system/css';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import type { RecipeVariant, RecipeVariantProps, SystemStyleObject } from '$styled-system/types';

  type $$Events = {
    change: Event & { currentTarget: HTMLInputElement };
  };

  type $$Props = Omit<HTMLInputAttributes, 'size' | 'style'> &
    RecipeVariantProps<typeof recipe> & {
      style?: SystemStyleObject;
    };

  type Variants = RecipeVariant<typeof recipe>;
  export let size: Variants['size'] = 'lg';

  export let style: SystemStyleObject | undefined = undefined;
  export let checked: boolean | null | undefined = undefined;

  const recipe = cva({
    base: {
      position: 'relative',
      display: 'flex',
      justifyContent: { base: 'flex-start', _checked: 'flex-end' },
      alignItems: 'center',
      borderRadius: 'full',
      aspectRatio: '[2/1]',
      backgroundColor: { base: 'gray.200', _checked: 'teal.500' },
      transition: 'common',
      appearance: 'none',
      cursor: 'pointer',
      _after: {
        content: '""',
        borderRadius: 'full',
        height: 'full',
        aspectRatio: '1/1',
        backgroundColor: 'gray.5',
      },
      _disabled: {
        justifyContent: 'flex-start',
        borderWidth: '1px',
        borderColor: 'gray.300',
        backgroundColor: 'gray.5',
        cursor: 'not-allowed',
        _after: { backgroundColor: 'gray.300' },
      },
    },
    variants: {
      size: {
        sm: { width: '30px', height: '16px', padding: '2px', borderRadius: '[24px]' },
        lg: { width: '44px', height: '24px', padding: '4px', borderRadius: '[36px]' },
      },
    },
  });
</script>

<label class={css(style)} for={$$restProps['name']}>
  <slot />
  <input id={$$restProps['name']} class={recipe({ size })} type="checkbox" on:change bind:checked {...$$restProps} />
</label>
