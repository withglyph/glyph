<script lang="ts">
  import { page } from '$app/stores';
  import { fragment, graphql } from '$houdini';
  import { Avatar, Button, Modal } from '$lib/components';
  import { FormField, TextInput } from '$lib/components/forms';
  import { createMutationForm } from '$lib/form';
  import { toast } from '$lib/notification';
  import { UpdateUserProfileInputSchema } from '$lib/validations';
  import type { MePreferencesPage_UpdateUserProfileModal_profile } from '$houdini';

  export let _profile: MePreferencesPage_UpdateUserProfileModal_profile;
  export let open = false;

  $: profile = fragment(
    _profile,
    graphql(`
      fragment MePreferencesPage_UpdateUserProfileModal_profile on Profile {
        name

        ...Avatar_profile
      }
    `),
  );

  const { form, handleSubmit, isSubmitting, setInitialValues } =
    createMutationForm({
      mutation: graphql(`
        mutation MePreferencesPage_UpdateUserProfileModal_UpdateUserProfile_Mutation(
          $input: UpdateUserProfileInput!
        ) {
          updateUserProfile(input: $input) {
            __typename
          }
        }
      `),
      schema: UpdateUserProfileInputSchema,
      onSuccess: () => {
        toast.success('프로필이 수정되었어요');
      },
    });

  $: setInitialValues({
    name: $profile.name,
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
            <Button class="text-sm" color="primary" size="md">
              새 아바타 업로드
            </Button>
            <button class="text-sm text-gray-50" type="button">
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

  <Button
    size="md"
    slot="action"
    loading={$isSubmitting}
    on:click={handleSubmit}
  >
    수정하기
  </Button>
</Modal>
