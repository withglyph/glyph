<script lang="ts">
  import { css } from '$styled-system/css';
  import type { SystemStyleObject } from '$styled-system/types';

  export let style: SystemStyleObject | undefined = undefined;
</script>

<td
  class={css(
    {
      paddingRight: '16px',
      paddingY: '16px',
      whiteSpace: 'nowrap',
      truncate: true,
      _firstOfType: { paddingLeft: '16px' },
    },
    style,
  )}
>
  <slot />
</td>
