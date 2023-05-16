<script lang="ts">
  import { goto } from '$app/navigation';
  import { graphql } from '$houdini';
  import { Button, Helmet, Link } from '$lib/components';
  import { FormField, PasswordInput, TextInput } from '$lib/components/forms';
  import { createMutationForm } from '$lib/form';
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

<div class="text-2xl font-bold">새 펜슬 계정 만들기</div>

<form class="mt-4 w-80 space-y-4" use:form>
  <FormField name="email" label="이메일">
    <TextInput class="w-full" />
  </FormField>

  <FormField name="password" label="비밀번호">
    <PasswordInput class="w-full" />
  </FormField>

  <FormField name="name" label="닉네임">
    <TextInput class="w-full" />
  </FormField>

  <Button class="w-full py-4" type="submit">가입하기</Button>
</form>

<div class="mt-2 text-xs text-gray-500">
  이미 계정이 있으신가요?
  <Link class="font-bold text-blue-500" href="/user/login">로그인하기</Link>
</div>
