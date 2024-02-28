<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import IconMailCheck from '~icons/tabler/mail-check';
  import { page } from '$app/stores';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Button, Icon } from '$lib/components';
  import { DigitsInput } from '$lib/components/forms';
  import { createMutationForm } from '$lib/form';
  import { IssueUserEmailAuthorizationUrlSchema } from '$lib/validations';
  import { css } from '$styled-system/css';
  import { circle, flex } from '$styled-system/patterns';

  $: email = $page.url.searchParams.get('email');

  const { form } = createMutationForm({
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
  });
</script>

<Helmet description="이메일로 전송된 코드를 통해 펜슬에 가입하거나 로그인할 수 있어요" title="코드로 시작하기" />

<div class={circle({ size: '64px', backgroundColor: 'teal.500' })}>
  <Icon style={css.raw({ size: '24px', color: 'white' })} icon={IconMailCheck} />
</div>

<div class={css({ marginTop: '16px', textAlign: 'center', fontSize: '14px' })}>
  {email}로 전송된 코드를 입력해주세요.
</div>

<form
  class={flex({ direction: 'column', align: 'center', marginTop: '16px', width: 'full', maxWidth: '350px' })}
  use:form
>
  <input name="email" type="hidden" value={email} />

  <DigitsInput name="code" />

  <Button style={css.raw({ marginTop: '12px', width: 'full' })} size="xl" type="submit">펜슬 시작하기</Button>
</form>

<a class={css({ marginTop: '16px', fontSize: '14px', color: 'gray.500' })} href="/login">이 이메일이 아닌가요?</a>
