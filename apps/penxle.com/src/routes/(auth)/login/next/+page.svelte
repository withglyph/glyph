<script lang="ts">
  import qs from 'query-string';
  import IconGoogle from '~icons/simple-icons/google';
  import IconNaver from '~icons/simple-icons/naver';
  import IconMailCheck from '~icons/tabler/mail-check';
  import { page } from '$app/stores';
  import { Button, Helmet, Icon } from '$lib/components';
  import { css } from '$styled-system/css';
  import { circle, flex } from '$styled-system/patterns';

  $: email = $page.url.searchParams.get('email');
</script>

<Helmet description="이메일로 전송된 코드를 통해 펜슬에 가입하거나 로그인할 수 있어요" title="펜슬 시작하기" />

<div class={circle({ size: '64px', backgroundColor: 'teal.500' })}>
  <Icon style={css.raw({ size: '24px', color: 'gray.5' })} icon={IconMailCheck} />
</div>

<div class={css({ marginTop: '16px', textAlign: 'center', fontSize: '14px' })}>
  {email} 으로 펜슬 로그인 링크를 보냈어요!
  <br />
  메일을 열어 링크를 클릭하면 로그인이 완료돼요.
</div>

<Button style={flex.raw({ gap: '8px', marginTop: '16px', width: 'full' })} href="https://mail.naver.com" type="link">
  <Icon icon={IconNaver} />
  네이버 메일 열기
</Button>

<Button style={flex.raw({ gap: '8px', marginTop: '8px', width: 'full' })} href="https://gmail.com" type="link">
  <Icon icon={IconGoogle} />
  지메일 열기
</Button>

<a
  class={css({ marginTop: '16px', fontSize: '14px', color: 'gray.500' })}
  href={qs.stringifyUrl({ url: '/login/code', query: { email } })}
>
  대신 코드 입력하기
</a>

<a class={css({ marginTop: '16px', fontSize: '14px', color: 'gray.500' })} href="/login">이 이메일이 아닌가요?</a>
