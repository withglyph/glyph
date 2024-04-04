<script lang="ts">
  import { goto } from '$app/navigation';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Helmet } from '$lib/components';
  import { Button } from '$lib/components/v2';
  import { FormField, TextInput } from '$lib/components/v2/forms';
  import { createMutationForm } from '$lib/form';
  import { LoginUserSchema } from '$lib/validations';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';

  const { form } = createMutationForm({
    mutation: graphql(`
      mutation LoginEmailPage_LoginUser_Mutation($input: LoginUserInput!) {
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
</script>

<Helmet description="이메일을 통해 글리프에 가입하거나 로그인할 수 있어요" title="이메일로 글리프 시작하기" />

<h1 class={css({ marginTop: { base: '32px', sm: '20px' }, marginBottom: '4px', fontSize: '24px', fontWeight: 'bold' })}>
  이메일로 시작하기
</h1>

<h2 class={css({ fontSize: '14px', color: 'gray.500' })}>로그인 또는 회원가입을 위해 이메일을 입력해주세요</h2>

<form class={flex({ direction: 'column', flexGrow: '1', marginTop: '36px', width: 'full' })} use:form>
  <FormField name="email" label="이메일">
    <TextInput style={css.raw({ width: 'full' })} placeholder="이메일을 입력해주세요" type="email" />
  </FormField>

  <Button style={css.raw({ marginTop: 'auto', marginBottom: '20px', width: 'full' })} size="lg" type="submit">
    다음
  </Button>
</form>
