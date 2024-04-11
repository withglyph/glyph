<script lang="ts">
  import dayjs from 'dayjs';
  import qs from 'query-string';
  import IconGoogle from '~icons/effit/google';
  import IconNaver from '~icons/effit/naver';
  import IconCheck from '~icons/tabler/check';
  import { page } from '$app/stores';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Helmet, Icon } from '$lib/components';
  import { Button } from '$lib/components/v2';
  import { css } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';

  $: email = $page.url.searchParams.get('email');

  const loginUser = graphql(`
    mutation LoginNextPage_loginUser_Mutation($input: LoginUserInput!) {
      loginUser(input: $input) {
        id
        email
      }
    }
  `);

  let emailResendTime: string | null = null;
</script>

<Helmet
  description="이메일로 전송된 코드를 통해 글리프에 가입하거나 로그인할 수 있어요"
  title="이메일로 글리프 시작하기"
/>

<h1 class={css({ marginTop: { base: '32px', sm: '20px' }, marginBottom: '4px', fontSize: '24px', fontWeight: 'bold' })}>
  이메일 인증
</h1>

<p class={css({ fontSize: '14px' })}>
  인증 메일이 {email}으로 전송되었어요
  <br />
  이메일을 열어 회원가입을 진행해주세요
</p>

<Button
  style={center.raw({ gap: '10px', marginTop: '36px', fontSize: '16px', width: 'full' })}
  href="https://gmail.com"
  size="lg"
  type="link"
  variant="gray-outline"
>
  <Icon style={css.raw({ size: '18px' })} icon={IconGoogle} />
  구글 이메일 열기
</Button>

<Button
  style={center.raw({ gap: '10px', marginTop: '11px', marginBottom: '36px', fontSize: '16px', width: 'full' })}
  href="https://mail.naver.com"
  size="lg"
  type="link"
  variant="gray-outline"
>
  <Icon icon={IconNaver} />
  네이버 이메일 열기
</Button>

<div
  class={center({
    width: 'full',
    gap: '15px',
    fontSize: '14px',
    color: 'gray.400',
    _before: { content: '""', display: 'block', width: 'full', height: '1px', backgroundColor: 'gray.100' },
    _after: { content: '""', display: 'block', width: 'full', height: '1px', backgroundColor: 'gray.100' },
  })}
>
  OR
</div>

<a
  class={css({ marginTop: '10px', marginX: 'auto', fontSize: '15px', color: 'gray.600' })}
  href={qs.stringifyUrl({ url: '/login/code', query: { email } })}
>
  코드 입력하기
</a>

<div class={css({ marginTop: 'auto' })}>
  {#if emailResendTime}
    <div
      class={flex({
        align: 'center',
        gap: '6px',
        borderWidth: '1px',
        borderColor: '[#DDF3E4]',
        marginBottom: '16px',
        paddingX: '16px',
        paddingY: '14px',
        fontSize: '13px',
        color: '[#18794E]',
        backgroundColor: 'cyan.50',
      })}
    >
      <Icon icon={IconCheck} />
      인증 메일이 재발송되었어요 ({emailResendTime})
    </div>
  {/if}

  <div
    class={flex({
      align: 'center',
      justify: 'space-between',
      marginBottom: '32px',
      fontSize: '14px',
      color: 'gray.500',
    })}
  >
    <a href="/login">이 이메일이 아닌가요?</a>

    <button
      type="button"
      on:click={async () => {
        if (!email) return;

        await loginUser({ email });
        mixpanel.track('user:login:start', { method: 'email' });
        emailResendTime = dayjs.kst().formatAsDateTime();
      }}
    >
      인증 메일 재전송
    </button>
  </div>
</div>
