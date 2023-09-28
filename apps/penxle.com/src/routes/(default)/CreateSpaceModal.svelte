<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Button, Modal } from '$lib/components';
  import { FormField, TextInput } from '$lib/components/forms';
  import { createMutationForm } from '$lib/form';
  import { toast } from '$lib/notification';
  import { CreateSpaceSchema } from '$lib/validations';

  export let open = false;

  const { form, handleSubmit, isSubmitting } = createMutationForm({
    mutation: graphql(`
      mutation DefaultLayout_CreateSpaceModal_CreateSpace_Mutation($input: CreateSpaceInput!) {
        createSpace(input: $input) {
          id
          slug
        }
      }
    `),
    schema: CreateSpaceSchema,
    onSuccess: async ({ slug }) => {
      mixpanel.track('space:create');
      toast.success('스페이스를 만들었어요.');
      await goto(`/${slug}`);
    },
  });
</script>

<Modal bind:open>
  <svelte:fragment slot="title">새 스페이스 만들기</svelte:fragment>

  <div
    class="flex items-center gap-4 rounded-lg from-red-40 via-brand-40 to-green-40 bg-gradient-to-rb p-4 text-sm text-white"
  >
    <span class="i-lc-info" />
    <div>
      스페이스는 창작물이 게시되고 모이는 공간이에요.
      <br />
      나만의 스페이스를 만들어 직접 창작한 글과 그림을 게시해보세요!
    </div>
  </div>

  <form class="mt-4" use:form>
    <div class="space-y-4">
      <FormField name="name" label="스페이스 이름">
        <TextInput class="w-full" />
      </FormField>

      <FormField name="slug" label="스페이스 URL">
        <TextInput class="w-full">
          <span slot="left-text">{$page.url.host}/</span>
        </TextInput>
      </FormField>
    </div>
  </form>

  <Button slot="action" loading={$isSubmitting} size="md" on:click={handleSubmit}>만들기</Button>
</Modal>
