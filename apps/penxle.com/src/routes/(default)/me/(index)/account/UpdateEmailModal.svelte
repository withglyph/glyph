<script lang="ts">
  import { graphql } from '$glitch';
  import { Button, Modal } from '$lib/components';
  import { FormField, TextInput } from '$lib/components/forms';
  import { createMutationForm } from '$lib/form';
  import { LoginInputSchema } from '$lib/validations';

  export let open = false;
  let value: HTMLInputElement['value'];

  const { form } = createMutationForm({
    mutation: graphql(`
      mutation LoginPage_Login_Mutation6($input: LoginInput!) {
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
  <svelte:fragment slot="title">변경할 이메일을 입력하세요</svelte:fragment>

  <form class="space-y-4" use:form>
    <FormField name="email" label="이메일 주소">
      <TextInput
        class="w-full font-bold"
        maxlength={10}
        placeholder="이메일 입력"
        bind:value
      />
    </FormField>

    <Button class="w-full" size="xl" type="submit">이메일 인증 보내기</Button>
  </form>
</Modal>
