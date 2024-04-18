<script lang="ts">
  import { Helmet } from '$lib/components';
  import { Button } from '$lib/components/v2';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
</script>

<Helmet description="휴대폰 본인인증을 통해 글리프 계정을 찾을 수 있어요" title="글리프 계정 찾기" />

<h1 class={css({ marginTop: { base: '32px', sm: '20px' }, marginBottom: '4px', fontSize: '24px', fontWeight: 'bold' })}>
  계정을 찾았어요!
</h1>

<h2 class={css({ fontSize: '14px', color: 'gray.500' })}>해당 계정으로 로그인되었어요</h2>

<div
  class={flex({
    align: 'center',
    justify: 'flex-start',
    gap: '6px',
    marginTop: '36px',
    textAlign: 'left',
    fontWeight: 'semibold',
    backgroundColor: 'gray.5',
    height: '48px',
  })}
>
  <!-- <Avatar $profile={} style={css.raw({ borderWidth: '1px', borderColor: 'gray.150', size: '36px' })} size={32} /> -->
  <div class={css({ borderWidth: '1px', borderColor: 'gray.150', borderRadius: 'full', size: '36px' })} />

  <div>
    <p class={css({ fontWeight: 'semibold' })}>유저 이름</p>
    <p class={css({ fontSize: '14px', color: 'gray.600' })}>example@example.com</p>
  </div>
</div>

<Button style={css.raw({ marginTop: 'auto', marginBottom: '32px' })} size="lg" variant="gradation-fill">
  글리프 접속하기
</Button>
