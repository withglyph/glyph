<script lang="ts">
  import { Button, Modal } from '$lib/components';
  import { FormField, TextInput } from '$lib/components/forms';

  export let open = false;

  // const { form } = createMutationForm({
  //   mutation: graphql(`
  //     mutation LoginPage_Login_Mutation5($input: LoginUserInput!) {
  //       loginUser(input: $input) {
  //         id
  //       }
  //     }
  //   `),
  //   schema: LoginUserSchema,
  //   onSuccess: () => {
  //     open = false;
  //   },
  // });
</script>

<Modal size="md" bind:open>
  <svelte:fragment slot="title">펜슬 계정을 탈퇴하시겠어요?</svelte:fragment>
  <svelte:fragment slot="subtitle">모든 데이터가 삭제되고 복구할 수 없어요</svelte:fragment>

  <form class="w-full">
    <FormField name="email" label="현재 이메일">
      <TextInput class="w-full" placeholder="이메일 입력" />
    </FormField>
  </form>
  <Button slot="action" class="w-full" size="xl" type="submit">탈퇴하기</Button>
</Modal>
