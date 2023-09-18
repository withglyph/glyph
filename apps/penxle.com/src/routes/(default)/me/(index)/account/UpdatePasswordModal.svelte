<script lang="ts">
  import { graphql } from '$glitch';
  import { Button, Modal } from '$lib/components';
  import { FormField, PasswordInput } from '$lib/components/forms';
  import { createMutationForm } from '$lib/form';
  import { LoginInputSchema } from '$lib/validations';

  export let open = false;

  const { form } = createMutationForm({
    mutation: graphql(`
      mutation LoginPage_Login_Mutation7($input: LoginInput!) {
        login(input: $input) {
          __typename
        }
      }
    `),
    schema: LoginInputSchema,
    onSuccess: () => {
      open = false;
    },
  });
</script>

<Modal size="md" bind:open>
  <svelte:fragment slot="title">새로운 비밀번호를 설정해주세요</svelte:fragment>
  <svelte:fragment slot="subtitle">
    비밀번호를 재설정하면 현재 사용중인 세션을 제외한 모든 세션에서
    로그아웃되어요.
  </svelte:fragment>

  <form class="space-y-4" use:form>
    <FormField name="oldPassword" label="비밀번호">
      <PasswordInput
        class="w-full font-bold"
        placeholder="기존 비밀번호 입력"
      />
    </FormField>

    <FormField name="newPassword" label="비밀번호">
      <PasswordInput class="w-full font-bold" placeholder="새 비밀번호 입력" />
    </FormField>

    <FormField name="newPasswordConfirm" label="비밀번호 확인">
      <PasswordInput
        class="w-full font-bold"
        placeholder="새 비밀번호 확인 입력"
      />
    </FormField>

    <Button class="w-full" size="xl" type="submit">비밀번호 변경</Button>
  </form>
</Modal>
