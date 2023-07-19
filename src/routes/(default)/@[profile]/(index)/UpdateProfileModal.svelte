<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { fragment, graphql } from '$houdini';
  import { Avatar, Button, Modal } from '$lib/components';
  import { FormField, TextInput } from '$lib/components/forms';
  import { createMutationForm } from '$lib/form';
  import { toast } from '$lib/notification';
  import { UpdateProfileInputSchema } from '$lib/validations';
  import type { ProfilePage_UpdateProfileModal_profile } from '$houdini';

  export let _profile: ProfilePage_UpdateProfileModal_profile;
  export let open = false;

  $: profile = fragment(
    _profile,
    graphql(`
      fragment ProfilePage_UpdateProfileModal_profile on Profile {
        name
        handle

        ...Avatar_profile
      }
    `),
  );

  const { form, handleSubmit, isSubmitting, setInitialValues } =
    createMutationForm({
      mutation: graphql(`
        mutation ProfilePage_UpdateProfileModal_UpdateProfile_Mutation(
          $input: UpdateProfileInput!
        ) {
          updateProfile(input: $input) {
            handle
          }
        }
      `),
      schema: UpdateProfileInputSchema,
      onSuccess: async (resp) => {
        await goto(`/@${resp.handle}`);
        toast.success('프로필이 수정되었어요');
      },
    });

  $: setInitialValues({
    name: $profile.name,
    handle: $profile.handle,
  });
</script>

<Modal bind:open>
  <svelte:fragment slot="title">프로필 수정하기</svelte:fragment>

  <form use:form>
    <div class="flex flex-col gap-4">
      <div>
        <div class="mb-2 select-none text-sm font-medium">아바타</div>
        <div class="flex items-center gap-4">
          <Avatar class="square-24" _profile={$profile} />
          <div class="flex flex-col items-center gap-2">
            <Button class="text-sm" color="brand">새 아바타 업로드</Button>
            <button class="text-sm text-gray-500" type="button">
              아바타 제거
            </button>
          </div>
        </div>
      </div>

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
    수정하기
  </Button>
</Modal>
