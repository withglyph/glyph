<script lang="ts">
  import { goto } from '$app/navigation';
  import Google from '$assets/icons/google.svg?component';
  import Naver from '$assets/icons/naver.svg?component';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Button, Helmet } from '$lib/components';
  import { FormField, TextInput } from '$lib/components/forms';
  import { createMutationForm } from '$lib/form';
  import { LoginUserSchema } from '$lib/validations';
  import { css } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';

  const { form } = createMutationForm({
    mutation: graphql(`
      mutation LoginPage_LoginUser_Mutation($input: LoginUserInput!) {
        loginUser(input: $input) {
          id
          email
        }
      }
    `),
    schema: LoginUserSchema,
    onSuccess: async (resp) => {
      mixpanel.track('user:login:start', { method: 'email' });
      await goto(`/login/next?email=${resp.email}`);
    },
  });

  const issueUserSingleSignOnAuthorizationUrl = graphql(`
    mutation LoginPage_IssueUserSingleSignOnAuthorizationUrl_Mutation(
      $input: IssueUserSingleSignOnAuthorizationUrlInput!
    ) {
      issueUserSingleSignOnAuthorizationUrl(input: $input) {
        url
      }
    }
  `);
</script>

<Helmet description="이메일을 통해 펜슬에 가입하거나 로그인할 수 있어요" title="펜슬 시작하기" />

<div class={center({ flexDirection: 'column', gap: '24px', marginBottom: '24px' })}>
  <div class={center({ flexDirection: 'column' })}>
    <h1 class={css({ fontSize: '24px', fontWeight: 'bold', color: 'gray.900', textAlign: 'center' })}>
      누구나 창작자가 되다, 펜슬
    </h1>
    <h2 class={css({ marginTop: '8px', fontSize: '15px', fontWeight: 'bold', color: 'gray.600' })}>
      이메일을 통해 펜슬에 가입하거나 로그인할 수 있어요
    </h2>
  </div>
</div>

<form class={css({ width: 'full', maxWidth: '350px' })} use:form>
  <div class={flex({ direction: 'column', gap: '12px' })}>
    <FormField name="email" label="이메일">
      <TextInput class={css({ width: 'full', fontWeight: 'bold' })} placeholder="이메일 입력" type="email" />
    </FormField>
  </div>

  <Button style={css.raw({ marginTop: '12px', width: 'full' })} size="xl" type="submit">펜슬 시작하기</Button>
</form>

<div class={flex({ gap: '24px', marginTop: '16px' })}>
  <button
    class={center({ borderRadius: 'full', size: '54px', backgroundColor: 'gray.100' })}
    type="button"
    on:click={async () => {
      const { url } = await issueUserSingleSignOnAuthorizationUrl({
        type: 'LOGIN',
        provider: 'GOOGLE',
      });

      mixpanel.track('user:login:start', { method: 'google' });
      location.href = url;
    }}
  >
    <Google class={css({ size: '24px' })} />
  </button>

  <button
    class={center({ borderRadius: 'full', size: '54px', backgroundColor: 'gray.100' })}
    type="button"
    on:click={async () => {
      const { url } = await issueUserSingleSignOnAuthorizationUrl({
        type: 'LOGIN',
        provider: 'NAVER',
      });

      mixpanel.track('user:login:start', { method: 'naver' });
      location.href = url;
    }}
  >
    <Naver class={css({ size: '24px' })} />
  </button>
</div>
