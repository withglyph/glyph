<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { graphql } from '$glitch';
  import { Button, Modal } from '$lib/components';
  import { FormField, PasswordInput } from '$lib/components/forms';
  import { createMutationForm } from '$lib/form';
  import { ResetPasswordInputSchema } from '$lib/validations';

  let open = false;
  let isExpired = false;

  onMount(() => {
    const code = $page.url.searchParams.get('code');

    if (code) {
      const expireDate = new Date(Number(code.split('.')[1]));
      const now = new Date();

      if (expireDate < now) {
        isExpired = true;
      }
    }
  });

  const { form } = createMutationForm({
    mutation: graphql(`
      mutation UserResetPasswordPage_ResetPassword_Mutation(
        $input: ResetPasswordInput!
      ) {
        resetPassword(input: $input)
      }
    `),
    schema: ResetPasswordInputSchema,
    onSuccess: () => {
      open = true;
    },
  });
</script>

<Helmet title="비밀번호 재설정" />

<h1 class="font-bold text-xl w-full max-w-87.5 mb-6">
  새로운 비밀번호를 설정해 주세요
</h1>

<form class="w-full max-w-87.5 space-y-4" use:form>
  <input name="code" type="hidden" value={$page.url.searchParams.get('code')} />

  <FormField name="password" label="비밀번호">
    <PasswordInput class="w-full font-bold" placeholder="비밀번호 입력" />
  </FormField>

  <FormField name="passwordConfirm" label="비밀번호 확인">
    <PasswordInput class="w-full font-bold" placeholder="비밀번호 확인 입력" />
  </FormField>

  <Button class="w-full" size="xl" type="submit">비밀번호 재설정하기</Button>
</form>

<Modal size="sm" bind:open>
  <svelte:fragment slot="title">비밀번호가 재설정 되었어요</svelte:fragment>

  <Button slot="action" class="w-full" href="/login" size="xl" type="link">
    로그인하러가기
  </Button>
</Modal>

<Modal size="sm" bind:open={isExpired}>
  <svelte:fragment slot="title">링크가 만료되었어요</svelte:fragment>

  <Button
    slot="action"
    class="w-full"
    href="/user/reset-password"
    size="xl"
    type="link"
  >
    계정찾기로 이동하기
  </Button>
</Modal>
