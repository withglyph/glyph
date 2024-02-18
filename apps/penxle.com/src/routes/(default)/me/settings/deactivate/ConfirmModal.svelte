<script lang="ts">
  import { graphql } from '$glitch';
  import { Button, Modal } from '$lib/components';
  import { FormField, TextInput } from '$lib/components/forms';
  import { createMutationForm } from '$lib/form';
  import { DeleteUserSchema } from '$lib/validations';
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
  });
</script>

<Modal size="md" bind:open>
  <svelte:fragment slot="title">펜슬로그 계정을 탈퇴하시겠어요?</svelte:fragment>
  <svelte:fragment slot="subtitle">모든 데이터가 삭제되고 복구할 수 없어요</svelte:fragment>

  <form class="w-full" use:form>
    <FormField name="email" label="현재 이메일">
      <TextInput class="w-full" placeholder="이메일 입력" />
    </FormField>
    <Button class="w-full m-t" size="xl" type="submit">탈퇴하기</Button>
  </form>
</Modal>

<CompleteModal bind:open={completeModalOpen} />
