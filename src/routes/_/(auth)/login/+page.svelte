<script lang="ts">
  import { goto } from '$app/navigation';
  import Logo from '$assets/branding/logo.svg?component';
  import { graphql } from '$houdini';
  import { Button, Helmet, Link } from '$lib/components';
  import { FormField, PasswordInput, TextInput } from '$lib/components/forms';
  import { createMutationForm } from '$lib/form';
  import { LoginInputSchema } from '$lib/validations';

  const { form } = createMutationForm({
    mutation: graphql(`
      mutation LoginPage_Login_Mutation($input: LoginInput!) {
        login(input: $input) {
          __typename
        }
      }
    `),
    schema: LoginInputSchema,
    refetch: false,
    onSuccess: async () => {
      await goto('/');
    },
  });
</script>

<Helmet title="로그인" />

<div class="flex items-center gap-4">
  <a href="/">
    <Logo class="square-8 rounded" />
  </a>
  <div class="h-10 border-x border-gray-900" />
  <div class="text-2xl font-bold">로그인</div>
</div>

<form class="mt-8 w-80" use:form>
  <div class="space-y-4">
    <FormField name="email" label="이메일">
      <TextInput class="w-full" />
    </FormField>

    <FormField name="password" label="비밀번호">
      <PasswordInput class="w-full" />
      <Link class="text-xs font-medium" colored href="/user/reset-password">
        비밀번호를 잊으셨나요?
      </Link>
    </FormField>
  </div>

  <Button class="mt-8 w-full py-4" type="submit">로그인</Button>
</form>

<div class="mt-2 text-xs text-gray-500">
  계정이 아직 없으신가요?
  <Link class="font-bold" colored href="/_/signup">새 계정 만들기</Link>
</div>
