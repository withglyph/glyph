<script lang="ts">
  import { Helmet, Link } from '@penxle/ui';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Button } from '$lib/components';
  import { Logo } from '$lib/components/branding';
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
          email

          profile {
            id
            name

            avatar {
              id
              url
            }
          }
        }
      }
    `),
    schema: SignUpInputSchema,
    refetch: false,
    onSuccess: (resp) => {
      mixpanel.identify(resp.id);
      mixpanel.track('user:signup', { method: 'email' });
      mixpanel.people.set({
        $email: resp.email,
        $name: resp.profile.name,
        $avatar: resp.profile.avatar.url,
      });
      location.href = '/';
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
  <Link class="font-bold" colored href="/login" underline>로그인하기</Link>
</div>
