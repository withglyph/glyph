<script lang="ts">
  import { css, cva } from '$styled-system/css';
  import type { HTMLAttributes } from 'svelte/elements';
  import type { RecipeVariant, RecipeVariantProps, SystemStyleObject } from '$styled-system/types';

  type $$Props = Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'style'> & {
    style?: SystemStyleObject;
  } & RecipeVariantProps<typeof recipe>;

  export let style: SystemStyleObject | undefined = undefined;
  export let variant: Variants['variant'] = 'outline';
  export let color: Variants['color'] = 'gray';

  type Variants = RecipeVariant<typeof recipe>;
  const recipe = cva({
    base: {
      fontSize: '11px',
      fontWeight: 'medium',
    },
    variants: {
      variant: {
        fill: { paddingX: '5px', paddingY: '3px' },
        outline: { borderWidth: '1px', paddingX: '4px', paddingY: '1px', backgroundColor: 'gray.0' },
      },
      color: {
        red: { color: 'red.600' },
        grass: { color: '[#18794E]' },
        blue: { color: '[#3451B2]' },
        pink: { color: '[#CD1D8D]' },
        violet: { color: '[#5746AF]' },
        gray: { color: 'gray.600' },
      },
    },
    compoundVariants: [
      {
        variant: 'fill',
        color: 'red',
        css: { backgroundColor: 'red.200' },
      },
      {
        variant: 'outline',
        color: 'red',
        css: { borderColor: '[#DC3D43BD]' },
      },
      {
        variant: 'fill',
        color: 'grass',
        css: { backgroundColor: '[#DDF3E4]' },
      },
      {
        variant: 'outline',
        color: 'grass',
        css: { borderColor: '[#18794EBD]' },
      },
      {
        variant: 'fill',
        color: 'blue',
        css: { backgroundColor: '[#D9E2FC]' },
      },
      {
        variant: 'outline',
        color: 'blue',
        css: { borderColor: '[#3451B2BD]' },
      },
      {
        variant: 'fill',
        color: 'pink',
        css: { backgroundColor: '[#FCE5F3]' },
      },
      {
        variant: 'outline',
        color: 'pink',
        css: { borderColor: '[#CD1D8DBD]' },
      },
      {
        variant: 'fill',
        color: 'violet',
        css: { backgroundColor: '[#EDE9FE]' },
      },
      {
        variant: 'outline',
        color: 'violet',
        css: { borderColor: '[#5746AFBD]' },
      },
      {
        variant: 'fill',
        color: 'gray',
        css: { backgroundColor: 'gray.200' },
      },
      {
        variant: 'outline',
        color: 'gray',
        css: { borderColor: '[#595959BD]' },
      },
    ],
  });
</script>

<div class={css(recipe.raw({ variant, color }), style)} {...$$restProps}>
  <slot />
</div>
