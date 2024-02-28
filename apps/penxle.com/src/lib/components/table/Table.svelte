<script lang="ts">
  import { css } from '$styled-system/css';
  import type { SystemStyleObject } from '$styled-system/types';

  export let style: SystemStyleObject | undefined = undefined;
</script>

<table class={css({ borderSpacing: '0', width: 'full', smDown: { tableLayout: 'fixed' } }, style)}>
  <slot />
</table>
