<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { graphql } from '$houdini';
  import { Button, Modal } from '$lib/components';
  import { FormField, TextInput } from '$lib/components/forms';
  import { createMutationForm } from '$lib/form';
  import { CreateProfileInputSchema } from '$lib/validations';

  export let open = false;

  const { form, handleSubmit, isSubmitting } = createMutationForm({
    mutation: graphql(`
      mutation DefaultLayout_CreateProfileModal_CreateProfile_Mutation(
        $input: CreateProfileInput!
      ) {
        createProfile(input: $input) {
          __typename
        }
      }
    `),
    schema: CreateProfileInputSchema,
    onSuccess: async () => {
      await goto('/');
    },
  });
</script>

<Modal bind:open>
  <svelte:fragment slot="title">새 프로필 만들기</svelte:fragment>

  <form use:form>
    <div class="space-y-4">
      <FormField name="name" label="닉네임">
        <TextInput class="w-full" />
      </FormField>

      <FormField name="handle" label="프로필 URL">
        <TextInput class="w-full">
          <span slot="left-text">{$page.url.host}/@</span>
        </TextInput>
      </FormField>
    </div>
  </form>

  <Button slot="action" loading={$isSubmitting} on:click={handleSubmit}>
    만들기
  </Button>
</Modal>
