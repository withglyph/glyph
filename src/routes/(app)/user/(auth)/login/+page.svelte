<script lang="ts">
  import { goto } from '$app/navigation';
  import Wordmark from '$assets/branding/wordmark.svg?component';
  import { graphql } from '$houdini';
  import { Button, Helmet, Link } from '$lib/components';
  import { PasswordInput, TextInput } from '$lib/components/forms';
  import { createMutationForm, FormValidationMessage } from '$lib/form';
  import { refreshAll } from '$lib/houdini';
  import { LoginInputSchema } from '$lib/validations';

  const { form } = createMutationForm({
    mutation: graphql(/* GraphQL */ `
      mutation LoginPage_Login_Mutation($input: LoginInput!) {
        login(input: $input) {
          __typename
        }
      }
    `),
    schema: LoginInputSchema,
    onSuccess: async () => {
      await refreshAll();
      await goto('/');
    },
  });
</script>

<Helmet title="로그인" />

<!-- <div class="text-2xl font-bold">로그인</div> -->

<div class="flex center">
  <Wordmark class="w-40 self-center text-brand-500" />
</div>

<form class="mt-12 w-80" use:form>
  <div class="space-y-4">
    <div>
      <div class="mb-1 flex justify-between">
        <label class="text-sm font-medium text-gray-700" for="email">
          이메일
        </label>
        <FormValidationMessage for="email" let:message>
          <div class="flex items-center gap-1 text-xs text-red-500">
            <span class="i-lc-alert-circle" />
            {message}
          </div>
        </FormValidationMessage>
      </div>
      <TextInput name="email" class="w-full" />
    </div>

    <div>
      <div class="mb-1 flex justify-between">
        <label class="text-sm font-medium text-gray-700" for="password">
          비밀번호
        </label>
        <FormValidationMessage for="password" let:message>
          <div class="flex items-center gap-1 text-xs text-red-500">
            <span class="i-lc-alert-circle" />
            {message}
          </div>
        </FormValidationMessage>
      </div>
      <PasswordInput name="password" class="w-full" />
      <Link class="text-xs font-medium text-blue-500" href="">
        비밀번호를 잊으셨나요?
      </Link>
    </div>
  </div>

  <Button class="mt-4 w-full" type="submit">로그인</Button>
</form>

<div class="mt-2 text-xs text-gray-500">
  계정이 아직 없으신가요?
  <Link class="font-bold text-blue-500" href="/user/signup">
    새 계정 만들기
  </Link>
</div>
