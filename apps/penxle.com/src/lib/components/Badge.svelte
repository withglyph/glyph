<script lang="ts">
  import { css, cva } from '$styled-system/css';
  import type { HTMLAttributes } from 'svelte/elements';
  import type { RecipeVariant, RecipeVariantProps, SystemStyleObject } from '$styled-system/types';

  type $$Props = Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'style'> & {
    style?: SystemStyleObject;
  } & RecipeVariantProps<typeof recipe>;

  export let style: SystemStyleObject | undefined = undefined;
  export let color: Variants['color'] = 'unselect';

  type Variants = RecipeVariant<typeof recipe>;
  const recipe = cva({
    base: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: '4px',
      padding: '10px',
      fontSize: '12px',
      fontWeight: 'bold',
    },
    variants: {
      color: {
        unselect: { color: 'gray.50', backgroundColor: 'gray.800' },
        select: { borderWidth: '1px', borderColor: 'gray.300' },
        green: { color: '[#4ECEA6]', backgroundColor: '[#ECFCF8]' },
        red: { color: '[#F66062]', backgroundColor: '[#FEEEED]' },
        gray: { color: 'gray.600', backgroundColor: 'gray.100' },
        purple: { color: '[#9656C9]', backgroundColor: '[#F4EEFD]' },
        orange: { color: '[#E9945B]', backgroundColor: '[#FEF5EE]' },
      },
    },
  });
</script>

<div class={css(recipe.raw({ color }), style)} {...$$restProps}>
  <slot />
</div>
