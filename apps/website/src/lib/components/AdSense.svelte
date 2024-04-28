<script lang="ts">
  import { css } from '$styled-system/css';
  import type { SystemStyleObject } from '$styled-system/types';

  export let style: SystemStyleObject | undefined = undefined;
  export let slotId: string;
</script>

<div class={css({ backgroundColor: 'gray.200' }, style)}>
  <ins
    style="display:block"
    class="adsbygoogle"
    data-ad-client="ca-pub-4449202773959958"
    data-ad-format="auto"
    data-ad-slot={slotId}
    data-full-width-responsive="true"
  ></ins>
</div>
