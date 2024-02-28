<script lang="ts">
  import LogoWhite from '$assets/icons/logo-white.svg?component';
  import WordmarkWhite from '$assets/icons/wordmark-white.svg?component';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
</script>

<header
  class={flex({
    align: 'center',
    paddingX: { base: '16px', sm: '30px' },
    paddingY: '8px',
    width: 'full',
    height: '60px',
    zIndex: '10',
  })}
>
  <a class={flex({ align: 'center', gap: '8px' })} href="/">
    <LogoWhite class={css({ size: '24px', hideBelow: 'sm' })} />
    <WordmarkWhite class={css({ height: '21px', color: 'gray.900' })} />
  </a>
</header>
