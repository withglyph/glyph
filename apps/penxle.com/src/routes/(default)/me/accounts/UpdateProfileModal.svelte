<script lang="ts">
  // import Camera from '$assets/icons/camera.svg?component';
  import { fragment, graphql } from '$glitch';
  import { Button, Image, Modal } from '$lib/components';
  import { FormField, TextInput } from '$lib/components/forms';
  import { createMutationForm } from '$lib/form';
  import { toast } from '$lib/notification';
  import { UpdateUserProfileInputSchema } from '$lib/validations';
  import type { MeAccountsPage_UpdateProfileModal_profile } from '$glitch';

  let _profile: MeAccountsPage_UpdateProfileModal_profile;
  export { _profile as $profile };
  export let open = false;

  $: profile = fragment(
    _profile,
    graphql(`
      fragment MeAccountsPage_UpdateProfileModal_profile on Profile {
        id
        name
        avatar {
          id
          ...Image_image
        }
      }
    `),
  );

  const { form, data, setInitialValues } = createMutationForm({
    mutation: graphql(`
      mutation MeAccountsPage_UpdateUserProfile_Mutation($input: UpdateUserProfileInput!) {
        updateUserProfile(input: $input) {
          id
          name
        }
      }
    `),
    schema: UpdateUserProfileInputSchema,
    initialValues: { name: '' },
    onSuccess: () => {
      open = false;
      toast.success('프로필이 변경되었어요.');
    },
  });

  $: setInitialValues({ name: $profile.name });
</script>

<Modal size="md" bind:open>
  <svelte:fragment slot="title">프로필 수정</svelte:fragment>

  <form use:form>
    <!-- <input bind:this={targetEl} accept="image/*" type="file" /> -->
    <button class="bg-gray-5 square-80 rounded-6 flex flex-col center mb-3 overflow-hidden mx-auto" type="button">
      <Image class="square-full" $image={$profile.avatar} />
    </button>

    <FormField name="name" label="닉네임">
      <TextInput class="w-full font-bold" maxlength={10} placeholder="닉네임 입력">
        <span slot="right-icon" class="text-sm text-gray-40">{$data.name.length} / 10</span>
      </TextInput>
    </FormField>

    <Button class="w-full mt-4" size="xl" type="submit">수정</Button>
  </form>
</Modal>
