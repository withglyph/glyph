<script lang="ts">
  import { goto } from '$app/navigation';
  import Wordmark from '$assets/branding/wordmark.svg?component';
  import { graphql } from '$houdini';
  import { Button, Helmet, Link } from '$lib/components';
  import { FormField, PasswordInput, TextInput } from '$lib/components/forms';
  import { createMutationForm } from '$lib/form';
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

<div class="flex center">
  <Wordmark class="w-40 self-center text-black" />
</div>

<form class="mt-8 w-80" use:form>
  <div class="space-y-4">
    <FormField name="email" label="이메일">
      <TextInput class="w-full" />
    </FormField>

    <FormField name="password" label="비밀번호">
      <PasswordInput class="w-full" />
      <Link class="text-xs font-medium text-blue-500" href="">
        비밀번호를 잊으셨나요?
      </Link>
    </FormField>
  </div>

  <Button class="mt-8 w-full py-4" type="submit">로그인</Button>
</form>

<div class="mt-2 text-xs text-gray-500">
  계정이 아직 없으신가요?
  <Link class="font-bold text-blue-500" href="/user/signup">
    새 계정 만들기
  </Link>
</div>
