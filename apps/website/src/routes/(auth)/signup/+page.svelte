<script lang="ts">
  import { page } from '$app/stores';
  import { graphql } from '$glitch';
  import { analytics } from '$lib/analytics';
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
          token
        }
      }
    `),
    schema: CreateUserSchema,
    initialValues: { name: '' },
    onSuccess: () => {
      analytics.track('user:signup:success');
      location.href = '/';
    },
  });

  $: setInitialValues({
    name: $query.provisionedUser.name ?? '',
    token: $page.url.searchParams.get('token') ?? '',
    termsConsent: false,
    isGte14: false,
    marketingConsent: false,
  });

  $: consentAll = $data.termsConsent && $data.isGte14 && $data.marketingConsent;
  const handleConsentAll: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { checked } = event.currentTarget;

    setFields('termsConsent', checked, true);
    setFields('isGte14', checked, true);
    setFields('marketingConsent', checked, true);
  };
</script>

<Helmet description="이메일을 통해 글리프에 가입하거나 로그인할 수 있어요" title="글리프 회원가입" />

<h1 class={css({ marginTop: { base: '32px', sm: '20px' }, marginBottom: '4px', fontSize: '24px', fontWeight: 'bold' })}>
  회원가입
</h1>

<h2 class={css({ fontSize: '14px', color: 'gray.500' })}>창작자를 위한 플랫폼 글리프와 함께하세요</h2>

<form class={flex({ direction: 'column', flexGrow: '1', width: 'full' })} use:form>
  <input name="token" type="hidden" value={$page.url.searchParams.get('token')} />

  <FormField name="name" style={css.raw({ marginTop: '36px' })} label="닉네임">
    <TextInput style={css.raw({ width: 'full' })} maxlength={20} placeholder="닉네임을 입력해주세요">
      <span slot="right-icon" class={css({ fontWeight: 'medium', color: 'gray.300', flex: 'none' })}>
        <mark class={css({ color: 'gray.600' })}>{$data.name?.length ?? 0}</mark>
        /20
      </span>
    </TextInput>
  </FormField>

  <section class={flex({ direction: 'column', marginTop: '16px' })}>
    <Checkbox
      style={css.raw({ fontWeight: 'semibold', marginBottom: '20px' })}
      checked={consentAll}
      variant="brand"
      on:change={handleConsentAll}
    >
      전체 동의
    </Checkbox>

    <Checkbox name="termsConsent" style={css.raw({ color: 'gray.600' })} size="sm" variant="brand">
      (필수)
      <Link href="https://help.withglyph.com/legal/terms" underline>이용약관</Link>
      및
      <Link href="https://help.withglyph.com/legal/privacy" underline>개인정보처리방침</Link> 동의
    </Checkbox>
    <Checkbox name="isGte14" style={css.raw({ color: 'gray.600' })} size="sm" variant="brand">
      (필수) 만 14세 이상입니다
    </Checkbox>
    <Checkbox name="marketingConsent" style={css.raw({ color: 'gray.600' })} size="sm" variant="brand">
      (선택) 광고성 알림 수신 동의
    </Checkbox>
  </section>

  <Button
    id="signup-button"
    style={css.raw({ marginTop: 'auto', marginBottom: '32px', width: 'full' })}
    size="lg"
    type="submit"
    variant="gradation-fill"
  >
    시작하기
  </Button>
</form>
