<script lang="ts">
  import { css } from '$styled-system/css';
  import type { SystemStyleObject } from '$styled-system/types';

  export let style: SystemStyleObject | undefined = undefined;
</script>

<th
  class={css(
    {
      borderBottomWidth: '1px',
      borderBottomColor: 'gray.150',
      paddingY: '10px',
      paddingX: '14px',
    },
    style,
  )}
  scope="col"
>
  <slot />
</th>
