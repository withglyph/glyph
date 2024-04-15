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
      'truncate': true,
      '& > td': {
        borderBottomWidth: '1px',
        borderBottomColor: 'gray.200',
      },
      '_lastOfType': { '& > td': { borderBottomWidth: '0' } },
    },
    style,
  )}
  {...$$restProps}
>
  <slot />
</tr>
