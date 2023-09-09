<script lang="ts">
  import { resetClient } from '@penxle/glitch';
  import { Helmet, Link } from '@penxle/ui';
  import { goto } from '$app/navigation';
  import { graphql } from '$glitch';
  import { Button } from '$lib/components';
  import {
    Checkbox,
    FormField,
    PasswordInput,
    TextInput,
  } from '$lib/components/forms';
  import { createMutationForm } from '$lib/form';
  import { SignUpInputSchema } from '$lib/validations';

  const { form } = createMutationForm({
    mutation: graphql(`
      mutation SignUpPage_SignUp_Mutation($input: SignUpInput!) {
        signUp(input: $input) {
          id
        }
      }
    `),
    schema: SignUpInputSchema,
    refetch: false,
    onSuccess: async () => {
      resetClient();
      await goto('/');
    },
  });
</script>

<Helmet title="새 계정 만들기" />

<h1 class="font-bold text-xl w-full max-w-87.5">펜슬 회원가입</h1>

<form class="mt-6 w-full max-w-87.5 space-y-4" use:form>
  <div class="space-y-3">
    <FormField name="email" label="이메일">
      <TextInput class="w-full font-bold" placeholder="이메일 입력" />
    </FormField>

    <FormField name="name" label="닉네임">
      <TextInput
        class="w-full font-bold"
        placeholder="닉네임 입력"
        maxlength={10}
      >
        <span slot="right-icon">0 / 10</span>
      </TextInput>
    </FormField>

    <FormField name="password" label="비밀번호">
      <PasswordInput class="w-full font-bold" placeholder="비밀번호 입력" />
    </FormField>

    <FormField name="passwordConfirm" label="비밀번호 확인">
      <PasswordInput
        class="w-full font-bold"
        placeholder="비밀번호 확인 입력"
      />
    </FormField>
  </div>

  <section class="my-4 space-y-3">
    <Checkbox name="isAgreed" class="font-bold">약관 전체 동의</Checkbox>
    <Checkbox name="isAgreed" class="text-sm">
      <Link href="/" underline>이용약관</Link> 및 <Link href="/" underline>
        개인정보 수집 이용
      </Link> 동의(필수)
    </Checkbox>
    <Checkbox name="isAgreed" class="text-sm">
      마케팅 정보 수집 동의(선택)
    </Checkbox>
  </section>

  <Button class="w-full" size="xl" type="submit">펜슬 회원가입 하기</Button>
</form>
