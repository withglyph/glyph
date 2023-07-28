<script lang="ts">
  import { goto } from '$app/navigation';
  import { graphql } from '$houdini';
  import { Button, Helmet, Link } from '$lib/components';
  import { Logo } from '$lib/components/branding';
  import {
    Checkbox,
    FormField,
    PasswordInput,
    TextInput,
  } from '$lib/components/forms';
  import { createMutationForm } from '$lib/form';
  import { SignupInputSchema } from '$lib/validations';

  const { form } = createMutationForm({
    mutation: graphql(`
      mutation SignupPage_Signup_Mutation($input: SignupInput!) {
        signup(input: $input) {
          __typename
        }
      }
    `),
    schema: SignupInputSchema,
    refetch: false,
    onSuccess: async () => {
      await goto('/');
    },
  });
</script>

<Helmet title="새 계정 만들기" />

<div class="flex items-center gap-4">
  <Logo class="square-8" />
  <div class="h-10 border-x border-gray-90" />
  <div class="text-2xl font-bold">새 펜슬 계정 만들기</div>
</div>

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

  <section class="pt-4 space-y-2">
    <Checkbox name="isAgreed">펜슬 이용약관에 동의합니다.</Checkbox>
    <Button class="w-full py-4" type="submit">가입하기</Button>
  </section>
</form>

<div class="mt-2 text-xs text-gray-50">
  이미 계정이 있으신가요?
  <Link class="font-bold" colored href="/_/login" underline>로그인하기</Link>
</div>
