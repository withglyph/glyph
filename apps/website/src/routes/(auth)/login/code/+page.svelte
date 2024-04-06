<script lang="ts">
  import dayjs from 'dayjs';
  import IconCheck from '~icons/tabler/check';
  import { page } from '$app/stores';
  import { graphql } from '$bifrost';
  import { mixpanel } from '$lib/analytics';
  import { Helmet, Icon } from '$lib/components';
  import { DigitsInput } from '$lib/components/forms';
  import { Button } from '$lib/components/v2';
  import { createMutationForm } from '$lib/form';
  import { IssueUserEmailAuthorizationUrlSchema } from '$lib/validations';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';

  $: email = $page.url.searchParams.get('email');

  const { form, handleSubmit, data, setErrors } = createMutationForm({
    mutation: graphql(`
      mutation LoginCodePage_IssueUserEmailAuthorizationUrl_Mutation($input: IssueUserEmailAuthorizationUrlInput!) {
        issueUserEmailAuthorizationUrl(input: $input) {
          url
        }
      }
    `),
    schema: IssueUserEmailAuthorizationUrlSchema,
    onSuccess: (resp) => {
      mixpanel.track('user:login:success', { method: 'email:code' });
      location.href = resp.url;
    },
    onError: (resp) => {
      // @ts-expect-error form validation error
      setErrors('code', resp.message);
    },
  });

  const loginUser = graphql(`
    mutation LoginCodePage_loginUser_Mutation($input: LoginUserInput!) {
      loginUser(input: $input) {
        id
        email
      }
    }
  `);

  let emailResendTime: string | null = null;
</script>

<Helmet description="이메일로 전송된 코드를 통해 글리프에 가입하거나 로그인할 수 있어요" title="코드로 시작하기" />

<h1 class={css({ marginTop: { base: '32px', sm: '20px' }, marginBottom: '4px', fontSize: '24px', fontWeight: 'bold' })}>
  이메일 인증
</h1>

<p class={css({ fontSize: '14px' })}>
  인증 메일이 {email}으로 전송되었어요
  <br />
  받으신 이메일을 열어 코드 6자리를 입력해주세요
</p>

<form
  class={flex({ direction: 'column', align: { base: 'flex-start', sm: 'center' }, marginTop: '32px', width: 'full' })}
  use:form
>
  <input name="email" type="hidden" value={email} />

  <DigitsInput name="code" />
</form>

<div class={css({ marginTop: 'auto' })}>
  {#if emailResendTime}
    <div
      class={flex({
        align: 'center',
        gap: '6px',
        borderWidth: '1px',
        borderColor: 'brand.200',
        marginBottom: '16px',
        paddingX: '16px',
        paddingY: '14px',
        fontSize: '13px',
        color: 'brand.400',
        backgroundColor: 'brand.50',
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
      marginBottom: '20px',
      fontSize: '14px',
      color: 'gray.500',
    })}
  >
    <a href="/login/next?email={email}">뒤로</a>
    <button
      type="button"
      on:click={async () => {
        if (!email) return;

        await loginUser({ email });
        mixpanel.track('user:login:start', { method: 'email:code' });
        emailResendTime = dayjs.kst().formatAsDateTime();
      }}
    >
      코드 재전송
    </button>
  </div>
</div>

<Button
  style={css.raw({ marginTop: '20px', marginBottom: '32px', width: 'full' })}
  disabled={$data.code?.length < 6}
  size="lg"
  variant="gradation-fill"
  on:click={handleSubmit}
>
  시작하기
</Button>
