<script lang="ts">
  import { graphql } from '$glitch';
  import { Button, Modal } from '$lib/components';
  import { FormField, PasswordInput } from '$lib/components/forms';
  import { createMutationForm } from '$lib/form';
  import { UpdatePasswordInputSchema } from '$lib/validations';

  export let open = false;
  let isSuccess = false;
  const { form } = createMutationForm({
    mutation: graphql(`
      mutation MeAccountPage_UpdatePassword_Mutation(
        $input: UpdatePasswordInput!
      ) {
        updatePassword(input: $input) {
          id
        }
      }
    `),
    schema: UpdatePasswordInputSchema,
    onSuccess: () => {
      open = false;
      isSuccess = true;
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
    <FormField name="oldPassword" label="기존 비밀번호">
      <PasswordInput
        class="w-full font-bold"
        placeholder="기존 비밀번호 입력"
      />
    </FormField>

    <FormField name="newPassword" label="새 비밀번호">
      <PasswordInput class="w-full font-bold" placeholder="새 비밀번호 입력" />
    </FormField>

    <FormField name="newPasswordConfirm" label="새 비밀번호 확인">
      <PasswordInput
        class="w-full font-bold"
        placeholder="새 비밀번호 확인 입력"
      />
    </FormField>

    <Button class="w-full" size="xl" type="submit">비밀번호 변경</Button>
  </form>
</Modal>

<Modal size="sm" bind:open={isSuccess}>
  <svelte:fragment slot="title">비밀번호 변경에 성공했어요</svelte:fragment>

  <Button class="w-full" size="xl" on:click={() => (isSuccess = false)}>
    확인
  </Button>
</Modal>
