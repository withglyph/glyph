<script lang="ts">
  import '../app.css';

  import { flex } from '$styled-system/patterns';
</script>

<div class={flex({ direction: 'column', minHeight: '100vh', fontFamily: 'PNXL_SUIT' })}>
  <slot />
</div>
