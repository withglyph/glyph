<script lang="ts">
  import { goto } from '$app/navigation';
  import { graphql } from '$glitch';
  import { Button, Modal } from '$lib/components';
  import { FormField, TextInput } from '$lib/components/forms';
  import { createMutationForm } from '$lib/form';
  import { toast } from '$lib/notification';
  import { DeleteUserSchema } from '$lib/validations';
  import { css } from '$styled-system/css';

  export let open = false;

  const { form, handleSubmit } = createMutationForm({
    mutation: graphql(`
      mutation MeSettingsDeactivatePage_DeleteUser_Mutation($input: DeleteUserInput!) {
        deleteUser(input: $input)
      }
    `),
    schema: DeleteUserSchema,
    onSuccess: async () => {
      toast.success('탈퇴가 완료되었어요');
      await goto('/');
    },
    onError: (resp) => {
      // @ts-expect-error form validation error
      toast.error(resp.message);
    },
  });
</script>

<Modal bind:open>
  <svelte:fragment slot="title">계정 탈퇴</svelte:fragment>

  <p class={css({ marginBottom: '12px', fontSize: '14px', color: 'gray.500', textAlign: 'left' })}>
    계정 탈퇴 시, 모든 데이터가 삭제되고 복구할 수 없어요
  </p>

  <form class={css({ width: 'full' })} use:form>
    <FormField name="email" label="현재 이메일">
      <TextInput placeholder="이메일 입력" />
    </FormField>
  </form>

  <Button slot="action" style={css.raw({ marginTop: '16px', width: 'full' })} size="lg" on:click={handleSubmit}>
    탈퇴하기
  </Button>
</Modal>
