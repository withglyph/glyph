<script lang="ts">
  import FullLogo from '$assets/logos/full.svg?component';
  import { Helmet, Link } from '$lib/components';
  import { css } from '$styled-system/css';
  import { center } from '$styled-system/patterns';
</script>

<Helmet description="글리프는 지금 점검중이에요" title="점검중" />

<div class={center({ flexDirection: 'column', flexGrow: '1', gap: '16px', marginX: 'auto', textAlign: 'center' })}>
  <FullLogo class={css({ height: '50px', color: 'gray.900' })} />

  <h2 class={css({ fontSize: '24px', fontWeight: 'semibold' })}>글리프는 지금 점검중이에요.</h2>

  <p class={css({ fontSize: '14px', color: 'gray.600' })}>
    서비스 점검이 진행중이에요.
    <br />
    잠시 후 다시 시도해주세요!
  </p>

  <Link style={css.raw({ fontSize: '14px' })} colored href="https://twitter.com/withglyph" underline>@withglyph</Link>
</div>
