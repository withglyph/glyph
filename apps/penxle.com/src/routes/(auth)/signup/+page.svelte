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
        }
      }
    `),
    schema: CreateUserSchema,
    initialValues: { name: '' },
    onSuccess: () => {
      mixpanel.track('user:signup');
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
    <Checkbox class="font-bold" checked={consentAll} on:change={handleConsentAll}>전체 동의</Checkbox>
    <Checkbox name="termsConsent" class="text-sm">
      <Link href="https://help.penxle.com/legal/terms" underline>이용약관</Link> 및 <Link
        href="https://help.penxle.com/legal/privacy"
        underline
      >
        개인정보처리방침
      </Link>에 동의해요 (필수)
    </Checkbox>
    <Checkbox name="marketingConsent" class="text-sm">이벤트 등 펜슬 소식 받아보기 (선택)</Checkbox>
  </section>
  <Button class="w-full" size="xl" type="submit">펜슬 회원가입 하기</Button>
</form>
