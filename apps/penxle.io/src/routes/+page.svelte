<script lang="ts">
  import CompanyLogo from '$assets/company-logo.svg?component';
  import { css } from '$styled-system/css';
  import { center } from '$styled-system/patterns';
</script>

<div class={center({ flexGrow: '1', margin: '32px', pointerEvents: 'none', userSelect: 'none' })}>
  <CompanyLogo class={css({ height: '33vh', color: 'gray.900' })} />
</div>
