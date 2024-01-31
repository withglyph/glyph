<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { goto } from '$app/navigation';
  import Google from '$assets/icons/google.svg?component';
  import Naver from '$assets/icons/naver.svg?component';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Button } from '$lib/components';
  import { FormField, TextInput } from '$lib/components/forms';
  import { createMutationForm } from '$lib/form';
  import { LoginUserSchema } from '$lib/validations';

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
      await goto(`/login/code?email=${resp.email}`);
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

<Helmet title="펜슬 시작하기" />

<div class="flex center flex-col gap-6 mb-6">
  <div class="flex center flex-col">
    <h1 class="text-gray-90 text-2xl font-extrabold text-center">함께 그리는 반짝임, 펜슬</h1>
    <h2 class="text-gray-60 text-3.75 mt-2 font-bold">이메일을 통해 펜슬에 가입하거나 로그인할 수 있어요</h2>
  </div>
</div>

<form class="w-full max-w-87.5" use:form>
  <div class="space-y-3">
    <FormField name="email" label="이메일">
      <TextInput class="w-full font-bold" placeholder="이메일 입력" />
    </FormField>
  </div>

  <Button class="w-full mt-3" size="xl" type="submit">펜슬 시작하기</Button>
</form>

<div class="flex gap-6 mt-4">
  <button
    class="flex center bg-surface-primary square-13.5 rounded-20"
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
    <Google class="square-6" />
  </button>

  <button
    class="flex center bg-surface-primary square-13.5 rounded-20"
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
    <Naver class="square-6" />
  </button>
</div>
