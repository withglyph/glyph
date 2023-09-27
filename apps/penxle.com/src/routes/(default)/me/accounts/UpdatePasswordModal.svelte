<script lang="ts">
  import { fragment, graphql } from '$glitch';
  import { Button, Modal } from '$lib/components';
  import { FormField, PasswordInput } from '$lib/components/forms';
  import { createMutationForm } from '$lib/form';
  import { toast } from '$lib/notification';
  import { UpdateUserPasswordInputSchema } from '$lib/validations';
  import type { MeAccountsPage_UpdatePasswordModal_user } from '$glitch';

  export let open = false;

  let _user: MeAccountsPage_UpdatePasswordModal_user;
  export { _user as $user };

  $: user = fragment(
    _user,
    graphql(`
      fragment MeAccountsPage_UpdatePasswordModal_user on User {
        id

        password {
          id
        }
      }
    `),
  );

  const { form } = createMutationForm({
    mutation: graphql(`
      mutation MeAccountsPage_UpdateUserPassword_Mutation($input: UpdateUserPasswordInput!) {
        updateUserPassword(input: $input) {
          id
        }
      }
    `),
    schema: UpdateUserPasswordInputSchema,
    onSuccess: () => {
      open = false;
      toast.success('비밀번호 변경에 성공했어요.');
    },
  });
</script>

<Modal size="md" bind:open>
  <svelte:fragment slot="title">새로운 비밀번호를 설정해주세요</svelte:fragment>
  <svelte:fragment slot="subtitle">
    {#if $user.password}
      비밀번호를 재설정하면 현재 사용중인 세션을 제외한 모든 세션에서 로그아웃되어요.
    {/if}
  </svelte:fragment>

  <form class="space-y-4" use:form>
    {#if $user.password?.id}
      <FormField name="oldPassword" label="기존 비밀번호">
        <PasswordInput class="w-full font-bold" placeholder="기존 비밀번호 입력" />
      </FormField>
    {/if}

    <FormField name="newPassword" label="새 비밀번호">
      <PasswordInput class="w-full font-bold" placeholder="새 비밀번호 입력" showStrength />
    </FormField>

    <FormField name="newPasswordConfirm" label="새 비밀번호 확인">
      <PasswordInput class="w-full font-bold" placeholder="새 비밀번호 확인 입력" />
    </FormField>

    <Button class="w-full" size="xl" type="submit">비밀번호 변경</Button>
  </form>
</Modal>
