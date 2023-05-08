<script lang="ts">
  import { goto } from '$app/navigation';
  import { graphql } from '$houdini';
  import { Button, Helmet, Link } from '$lib/components';
  import { PasswordInput, TextInput } from '$lib/components/forms';
  import { createMutationForm, FormValidationMessage } from '$lib/form';
  import { refreshAll } from '$lib/houdini';
  import { SignupInputSchema } from '$lib/validations';

  const { form } = createMutationForm({
    mutation: graphql(/* GraphQL */ `
      mutation UserSignupPage_Signup_Mutation($input: SignupInput!) {
        signup(input: $input) {
          __typename
        }
      }
    `),
    schema: SignupInputSchema,
    onSuccess: async () => {
      await refreshAll();
      await goto('/');
    },
  });
</script>

<Helmet title="새 계졍 만들기" />

<div class="text-2xl font-bold">새 계정 만들기</div>

<form class="w-80" use:form>
  <div class="my-8 space-y-4">
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
    </div>

    <div>
      <div class="mb-1 flex justify-between">
        <label class="text-sm font-medium" for="name">닉네임</label>
        <FormValidationMessage for="name" let:message>
          <div class="flex items-center gap-1 text-xs text-red-500">
            <span class="i-lc-alert-circle" />
            {message}
          </div>
        </FormValidationMessage>
      </div>
      <TextInput name="name" class="w-full" />
    </div>
  </div>

  <Button class="mt-4 w-full" type="submit">가입하기</Button>
</form>

<div class="mt-2 text-xs text-gray-500">
  이미 계정이 있으신가요?
  <Link class="font-bold text-blue-500" href="/user/login">로그인하기</Link>
</div>
