<script lang="ts">
  import { css } from '$styled-system/css';
  import type { SystemStyleObject } from '$styled-system/types';

  export let style: SystemStyleObject | undefined = undefined;
</script>

<td
  class={css(
    {
      padding: '14px',
      fontSize: { base: '14px', sm: '15px' },
      color: 'gray.600',
      truncate: true,
    },
    style,
  )}
>
  <slot />
</td>
