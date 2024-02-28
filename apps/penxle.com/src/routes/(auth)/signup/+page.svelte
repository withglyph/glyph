<script lang="ts">
  import { page } from '$app/stores';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Button, Helmet, Link } from '$lib/components';
  import { Checkbox, FormField, TextInput } from '$lib/components/forms';
  import { createMutationForm } from '$lib/form';
  import { CreateUserSchema } from '$lib/validations';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import type { ChangeEventHandler } from 'svelte/elements';

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
      mixpanel.track('user:signup:success');
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
  const handleConsentAll: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { checked } = event.currentTarget;
    setFields('termsConsent', checked, true);
    setFields('marketingConsent', checked, true);
  };
</script>

<Helmet description="이메일을 통해 펜슬에 가입하거나 로그인할 수 있어요" title="펜슬 가입하기" />

<h1 class={css({ width: 'full', maxWidth: '350px', fontSize: '20px', fontWeight: 'bold' })}>펜슬 가입하기</h1>

<form class={flex({ direction: 'column', gap: '16px', marginTop: '24px', width: 'full', maxWidth: '350px' })} use:form>
  <input name="token" type="hidden" value={$page.url.searchParams.get('token')} />

  <FormField name="name" label="닉네임">
    <TextInput class={css({ width: 'full', fontWeight: 'bold' })} maxlength={20} placeholder="닉네임 입력">
      <span slot="right-icon" class={css({ fontSize: '14px', fontWeight: 'medium', color: 'gray.400' })}>
        {$data.name.length}/20
      </span>
    </TextInput>
  </FormField>

  <section class={flex({ direction: 'column', gap: '12px', marginY: '16px' })}>
    <Checkbox style={css.raw({ fontWeight: 'bold' })} checked={consentAll} on:change={handleConsentAll}>
      전체 동의
    </Checkbox>
    <Checkbox name="termsConsent" style={css.raw({ fontSize: '14px' })}>
      <Link href="https://help.penxle.com/legal/terms" underline>이용약관</Link> 및 <Link
        href="https://help.penxle.com/legal/privacy"
        underline
      >
        개인정보처리방침
      </Link>에 동의해요 (필수)
    </Checkbox>
    <Checkbox name="marketingConsent" style={css.raw({ fontSize: '14px' })}>
      이벤트 등 펜슬 소식 받아보기 (선택)
    </Checkbox>
  </section>
  <Button style={css.raw({ width: 'full' })} size="xl" type="submit">펜슬 회원가입 하기</Button>
</form>
