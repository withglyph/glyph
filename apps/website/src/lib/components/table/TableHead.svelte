<script lang="ts">
  import { css } from '$styled-system/css';
  import type { SystemStyleObject } from '$styled-system/types';

  export let style: SystemStyleObject | undefined = undefined;
</script>

<th
  class={css(
    {
      borderYWidth: '1px',
      borderColor: 'gray.200',
      paddingY: '8px',
      _firstOfType: { borderLeftWidth: '1px', borderLeftRadius: '8px', paddingLeft: '16px' },
      _lastOfType: { borderRightWidth: '1px', borderRightRadius: '8px', paddingRight: '16px' },
    },
    style,
  )}
  scope="col"
>
  <slot />
</th>
