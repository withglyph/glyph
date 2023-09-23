<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import Wordmark from '$assets/branding/wordmark.svg?component';
  import Google from '$assets/icons/google.svg?component';
  import Naver from '$assets/icons/naver.svg?component';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Button } from '$lib/components';
  import { Logo } from '$lib/components/branding';
  import { FormField, PasswordInput, TextInput } from '$lib/components/forms';
  import { createMutationForm } from '$lib/form';
  import { LoginInputSchema } from '$lib/validations';

  const { form } = createMutationForm({
    mutation: graphql(`
      mutation LoginPage_Login_Mutation($input: LoginInput!) {
        login(input: $input) {
          id
        }
      }
    `),
    schema: LoginInputSchema,
    onSuccess: (resp) => {
      mixpanel.identify(resp.id);
      mixpanel.track('user:login', { method: 'email' });
      location.href = '/';
    },
  });

  const issueSSOAuthorizationUrl = graphql(`
    mutation LoginPage_IssueSSOAuthorizationUrl_Mutation($input: IssueSSOAuthorizationUrlInput!) {
      issueSSOAuthorizationUrl(input: $input) {
        url
      }
    }
  `);
</script>

<Helmet title="로그인" />

<div class="flex center flex-col gap-6 mb-6">
  <div class="flex center">
    <Logo class="mr-2 square-6" />
    <Wordmark class="h-5" />
  </div>
  <div class="flex center flex-col">
    <h1 class="text-gray-90 text-2xl font-extrabold text-center">함께 그리는 반짝임, 펜슬</h1>
    <h2 class="text-gray-50 text-[15px] mt-2 font-bold">2차창작 펜슬과 함께하세요</h2>
  </div>
</div>

<form class="w-full max-w-87.5" use:form>
  <div class="space-y-3">
    <FormField name="email" label="이메일">
      <TextInput class="w-full font-bold" placeholder="이메일 입력" />
    </FormField>

    <FormField name="password" label="비밀번호">
      <PasswordInput class="w-full font-bold" placeholder="비밀번호 입력" />
    </FormField>
  </div>

  <Button class="w-full mt-3" size="xl" type="submit">로그인</Button>
</form>

<Button class="w-full mt-3 max-w-87.5" color="secondary" href="/signup" size="xl" type="link">회원가입</Button>

<Button class="w-full my-4 text-gray-50" href="/user/forgot-password" size="lg" type="link" variant="text">
  계정을 찾을 수 없나요?
</Button>

<div class="flex gap-6">
  <button
    class="flex center bg-gray-10 square-13.5 rounded-20"
    type="button"
    on:click={async () => {
      const { url } = await issueSSOAuthorizationUrl({
        type: 'AUTH',
        provider: 'GOOGLE',
      });

      location.href = url;
    }}
  >
    <Google class="square-8" />
  </button>

  <button
    class="flex center bg-gray-10 square-13.5 rounded-20"
    type="button"
    on:click={async () => {
      const { url } = await issueSSOAuthorizationUrl({
        type: 'AUTH',
        provider: 'NAVER',
      });

      location.href = url;
    }}
  >
    <Naver class="square-6" />
  </button>
</div>
