<script lang="ts">
  import { css } from '$styled-system/css';
  import type { SvelteHTMLElements } from 'svelte/elements';
  import type { SystemStyleObject } from '$styled-system/types';

  type HTMLTableRowElement = SvelteHTMLElements['tr'];

  type $$Props = Omit<HTMLTableRowElement, 'class' | 'style'> & { style?: SystemStyleObject };

  export let style: SystemStyleObject | undefined = undefined;
</script>

<tr
  class={css(
    {
      '& > td': {
        borderBottomWidth: '1px',
        borderBottomColor: 'gray.150',
      },
      'truncate': true,
    },
    style,
  )}
  {...$$restProps}
>
  <slot />
</tr>
