<script lang="ts">
  import { graphql } from '$glitch';
  import { Button, Modal } from '$lib/components';
  import { FormField, TextInput } from '$lib/components/forms';
  import { createMutationForm } from '$lib/form';
  import { toast } from '$lib/notification';
  import { DeleteUserSchema } from '$lib/validations';
  import { css } from '$styled-system/css';
  import CompleteModal from './CompleteModal.svelte';

  export let open = false;

  let completeModalOpen = false;

  const { form } = createMutationForm({
    mutation: graphql(`
      mutation MeSettingsDeactivatePage_DeleteUser_Mutation($input: DeleteUserInput!) {
        deleteUser(input: $input)
      }
    `),
    schema: DeleteUserSchema,
    onSuccess: () => {
      completeModalOpen = true;
    },
    onError: (resp) => {
      // @ts-expect-error form validation error
      toast.error(resp.message);
    },
  });
</script>

<Modal size="md" bind:open>
  <svelte:fragment slot="title">글리프 계정을 탈퇴하시겠어요?</svelte:fragment>
  <svelte:fragment slot="subtitle">모든 데이터가 삭제되고 복구할 수 없어요</svelte:fragment>

  <form class={css({ width: 'full' })} use:form>
    <FormField name="email" label="현재 이메일">
      <TextInput style={css.raw({ width: 'full' })} placeholder="이메일 입력" />
    </FormField>
    <Button style={css.raw({ marginTop: '16px', width: 'full' })} size="xl" type="submit">탈퇴하기</Button>
  </form>
</Modal>

<CompleteModal bind:open={completeModalOpen} />
