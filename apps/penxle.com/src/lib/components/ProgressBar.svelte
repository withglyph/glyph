<script lang="ts">
  import { css } from '$styled-system/css';

  export let value: number;
  export let max: number;
</script>

<div class={css({ paddingRight: '26px', backgroundColor: 'gray.100', height: '3px' })}>
  <div
    style:width={`${(value / max) * 100}%`}
    class={css({
      borderRightRadius: '8px',
      backgroundColor: 'gray.900',
      height: '3px',
    })}
  />
</div>
