<script lang="ts">
  import { css } from '$styled-system/css';
  import type { SystemStyleObject } from '$styled-system/types';

  export let style: SystemStyleObject | undefined = undefined;
</script>

<div
  class={css(
    {
      'display': 'flex',

      '& > *': {
        flex: '1',
      },

      '& > *:first-child': {
        'borderRightRadius': '0',

        '&:not(:has(:checked))': {
          borderRightWidth: '0',
        },
      },

      '& > *:not(:first-child, :last-child)': {
        borderLeftRadius: '0',
        borderRightRadius: '0',
      },

      '& > *:not(:first-child, :last-child, :has(:checked))': {
        borderRightWidth: '0',
      },

      '& > *:has(:checked) + *': {
        borderLeftWidth: '0',
      },

      '& > *:last-child': {
        borderLeftRadius: '0',
      },
    },
    style,
  )}
  role="group"
>
  <slot />
</div>
