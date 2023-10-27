<script lang="ts">
  import { Helmet, Link } from '@penxle/ui';
  import { page } from '$app/stores';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Button } from '$lib/components';
  import { Checkbox, FormField, TextInput } from '$lib/components/forms';
  import { createMutationForm } from '$lib/form';
  import { CreateUserSchema } from '$lib/validations';

  $: query = graphql(`
    query SignupPage_Query($token: String!) {
      provisionedUser(token: $token) {
        id
        name
        email
      }
    }
  `);

  const { form, data, setFields, setInitialValues } = createMutationForm({
    mutation: graphql(`
      mutation SignupPage_CreateUser_Mutation($input: CreateUserInput!) {
        createUser(input: $input) {
          id
          email
          profile {
            name
            avatar {
              url
            }
          }
        }
      }
    `),
    schema: CreateUserSchema,
    initialValues: { name: '' },
    onSuccess: (resp) => {
      mixpanel.identify(resp.id);
      mixpanel.track('user:signup');
      mixpanel.people.set({
        $email: resp.email,
        $name: resp.profile.name,
        $avatar: resp.profile.avatar.url,
      });

      location.href = '/';
    },
  });

  $: setInitialValues({
    name: $query.provisionedUser.name ?? '',
    token: $page.url.searchParams.get('token') ?? '',
    termsConsent: false,
    marketingConsent: false,
  });

  $: consentAll = $data.termsConsent && $data.marketingConsent;
  const handleConsentAll = (event: Event) => {
    const { checked } = event.currentTarget as HTMLInputElement;
    setFields('termsConsent', checked);
    setFields('marketingConsent', checked);
  };
</script>

<Helmet title="펜슬 시작하기" />

<h1 class="font-bold text-xl w-full max-w-87.5">펜슬 회원가입</h1>

<form class="mt-6 w-full max-w-87.5 space-y-4" use:form>
  <input name="token" type="hidden" value={$page.url.searchParams.get('token')} />

  <FormField name="name" label="닉네임">
    <TextInput class="w-full font-bold" maxlength={20} placeholder="닉네임 입력">
      <span slot="right-icon" class="body-14-m text-disabled">{$data.name.length} / 20</span>
    </TextInput>
  </FormField>

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
