<script lang="ts">
  import { graphql } from '$houdini';
  import { Button, Modal } from '$lib/components';
  import { FormField, PasswordInput } from '$lib/components/forms';
  import { createMutationForm } from '$lib/form';
  import { LoginInputSchema } from '$lib/validations';

  export let open = false;

  const { form } = createMutationForm({
    mutation: graphql(`
      mutation LoginPage_Login_Mutation($input: LoginInput!) {
        login(input: $input) {
          __typename
        }
      }
    `),
    schema: LoginInputSchema,
    refetch: false,
    onSuccess: () => {
      open = false;
    },
  });
</script>

<Modal bind:open size="md">
  <svelte:fragment slot="title">
    탈퇴를 진행하실 수 있도록 사용하고 계신 비밀번호를 입력해 주세요
  </svelte:fragment>
  <svelte:fragment slot="subtitle">
    모든 데이터가 삭제되고 복구할 수 없어요
  </svelte:fragment>

  <form class="w-full" use:form>
    <div>
      <FormField name="password" label="비밀번호">
        <PasswordInput class="w-full font-bold" placeholder="비밀번호 입력" />
      </FormField>
    </div>

    <Button class="w-full mt-3" type="submit" size="xl">탈퇴하기</Button>
  </form>
</Modal>
