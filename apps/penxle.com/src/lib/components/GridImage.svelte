<script lang="ts">
  import { Image } from '$lib/components';
  import { css, sva } from '$styled-system/css';
  import type { Image_image } from '$glitch';
  import type { SystemStyleObject } from '$styled-system/types';

  export let style: SystemStyleObject | undefined = undefined;
  export let images: Image_image[];

  const recipe = sva({
    slots: ['root', 'item'],
    base: {
      root: { display: 'grid' },
      item: { display: 'grid' },
    },
    variants: {
      length: {
        1: {
          root: { gridTemplateColumns: '1' },
          item: { borderRadius: '8px' },
        },
        2: {
          root: { gridTemplateColumns: '2' },
          item: { _firstOfType: { borderLeftRadius: '8px' }, _lastOfType: { borderRightRadius: '8px' } },
        },
        3: {
          root: { gridTemplateColumns: '2', gridTemplateRows: '2' },
          item: {
            _firstOfType: { borderTopLeftRadius: '8px' },
            _even: { borderTopRightRadius: '8px' },
            _lastOfType: { gridColumn: '[1/-1]', borderBottomRadius: '8px' },
          },
        },
        4: {
          root: { gridTemplateColumns: '2', gridTemplateRows: '2' },
          item: {
            _firstOfType: { borderTopLeftRadius: '8px', borderBottomLeftRadius: '0' },
            _even: { borderTopRightRadius: '8px' },
            _odd: { borderBottomLeftRadius: '8px' },
            _lastOfType: { borderTopRightRadius: '0', borderBottomRightRadius: '8px' },
          },
        },
      },
    },
  });

  $: styles = recipe.raw({ length: images.length as 1 | 2 | 3 | 4 });
</script>

<div class={css(styles.root, style)}>
  {#each images.slice(0, 4) as image, idx (idx)}
    <Image style={styles.item} $image={image} />
  {/each}
</div>
