<script lang="ts">
  import { css } from '$styled-system/css';
  import type { SystemStyleObject } from '$styled-system/types';

  export let style: SystemStyleObject | undefined = undefined;
</script>

<thead
  class={css(
    {
      '& > tr': {
        fontSize: '14px',
        fontWeight: 'semibold',
        backgroundColor: 'gray.50',
      },
    },
    style,
  )}
>
  <slot />
</thead>
