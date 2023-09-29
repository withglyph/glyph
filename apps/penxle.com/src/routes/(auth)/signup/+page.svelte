<script lang="ts">
  import { Helmet, Link } from '@penxle/ui';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Button } from '$lib/components';
  import { Checkbox, FormField, PasswordInput, TextInput } from '$lib/components/forms';
  import { createMutationForm } from '$lib/form';
  import { SignUpInputSchema } from '$lib/validations';

  const { form, data, setFields } = createMutationForm({
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
    initialValues: { name: '' },
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

  $: consentAll = $data.termsConsent && $data.marketingConsent;

  const handleConsentAll = (event: Event) => {
    const { checked } = event.currentTarget as HTMLInputElement;
    setFields('termsConsent', checked);
    setFields('marketingConsent', checked);
  };
</script>

<Helmet title="새 계정 만들기" />

<h1 class="font-bold text-xl w-full max-w-87.5">펜슬 회원가입</h1>

<form class="mt-6 w-full max-w-87.5 space-y-4" use:form>
  <div class="space-y-3">
    <FormField name="email" label="이메일">
      <TextInput class="w-full font-bold" placeholder="이메일 입력" />
    </FormField>

    <FormField name="name" label="닉네임">
      <TextInput class="w-full font-bold" maxlength={10} placeholder="닉네임 입력">
        <span slot="right-icon" class="text-sm text-gray-40">{$data.name.length} / 10</span>
      </TextInput>
    </FormField>

    <FormField name="password" label="비밀번호">
      <PasswordInput class="w-full font-bold" placeholder="비밀번호 입력" showStrength />
    </FormField>

    <FormField name="passwordConfirm" label="비밀번호 확인">
      <PasswordInput class="w-full font-bold" placeholder="비밀번호 확인 입력" />
    </FormField>
  </div>

  <section class="my-4 space-y-3">
    <Checkbox class="font-bold" checked={consentAll} on:change={handleConsentAll}>약관 전체 동의</Checkbox>
    <Checkbox name="termsConsent" class="text-sm">
      <Link href="https://help.penxle.com/legal/terms" underline>이용약관</Link> 및 <Link
        href="https://help.penxle.com/legal/privacy"
        underline
      >
        개인정보 수집 이용
      </Link> 동의(필수)
    </Checkbox>
    <Checkbox name="marketingConsent" class="text-sm">마케팅 정보 수집 동의(선택)</Checkbox>
  </section>

  <Button class="w-full" size="xl" type="submit">펜슬 회원가입 하기</Button>
</form>
