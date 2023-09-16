<script lang="ts">
  import { graphql } from '$glitch';
  import { Button, Modal } from '$lib/components';
  import { FormField, TextInput } from '$lib/components/forms';
  import { createMutationForm } from '$lib/form';
  import { LoginInputSchema } from '$lib/validations';

  export let open = false;

  const { form } = createMutationForm({
    mutation: graphql(`
      mutation LoginPage_Login_Mutation4($input: LoginInput!) {
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
  <svelte:fragment slot="title">프로필 수정</svelte:fragment>

  <form use:form>
    <FormField name="name" label="닉네임">
      <TextInput
        class="w-full font-bold"
        maxlength={10}
        placeholder="닉네임 입력"
      >
        <span slot="right-icon">0 / 10</span>
      </TextInput>
    </FormField>
  </form>

  <Button class="w-full" href="/" size="xl" type="link">홈으로 가기</Button>
</Modal>
