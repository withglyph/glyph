<script lang="ts">
  // import Camera from '$assets/icons/camera.svg?component';
  import ky from 'ky';
  import { fragment, graphql } from '$glitch';
  import { Button, Image, Modal } from '$lib/components';
  import { FormField, TextInput } from '$lib/components/forms';
  import { Thumbnailer } from '$lib/components/media';
  import { createMutationForm } from '$lib/form';
  import { toast } from '$lib/notification';
  import { trackable } from '$lib/svelte/store';
  import { UpdateUserProfileSchema } from '$lib/validations';
  import type { MeSettingsPage_UpdateProfileModal_profile } from '$glitch';
  import type { Region } from '$lib/components/media';

  let _profile: MeSettingsPage_UpdateProfileModal_profile;
  export { _profile as $profile };
  export let open = false;

  let fileEl: HTMLInputElement;
  let openThumbnailer = false;

  let region: Region | undefined = undefined;
  let file: File | null = null;
  const uploading = trackable();

  $: profile = fragment(
    _profile,
    graphql(`
      fragment MeSettingsPage_UpdateProfileModal_profile on Profile {
        id
        name
        avatar {
          id
          ...Image_image
        }
      }
    `),
  );

  let avatar: typeof $profile.avatar;
  $: avatar = $profile.avatar;

  const { form, data, setInitialValues } = createMutationForm({
    mutation: graphql(`
      mutation MeSettingsPage_UpdateProfileModal_UpdateUserProfile_Mutation($input: UpdateUserProfileInput!) {
        updateUserProfile(input: $input) {
          id
          name
          avatar {
            id
          }
        }
      }
    `),
    schema: UpdateUserProfileSchema,
    initialValues: { name: '' },
    extra: () => ({ avatarId: avatar.id }),
    onSuccess: () => {
      open = false;
      toast.success('프로필이 수정되었어요.');
    },
  });

  $: setInitialValues({
    avatarId: avatar.id,
    name: $profile.name,
  });

  const prepareImageUpload = graphql(`
    mutation MeSettingsPage_UpdateProfileModal_PrepareImageUpload_Mutation {
      prepareImageUpload {
        key
        presignedUrl
      }
    }
  `);

  const finalizeImageUpload = graphql(`
    mutation MeSettingsPage_UpdateProfileModal_FinalizeImageUpload_Mutation($input: FinalizeImageUploadInput!) {
      finalizeImageUpload(input: $input) {
        id
        ...Image_image
      }
    }
  `);

  const uploadAvatar = async () => {
    uploading.track(async () => {
      if (!file) {
        return;
      }

      const { key, presignedUrl } = await prepareImageUpload();
      await ky.put(presignedUrl, { body: file });
      avatar = await finalizeImageUpload({ key, name: file.name, bounds: region });

      openThumbnailer = false;
    });
  };
</script>

<Modal size="md" bind:open>
  <svelte:fragment slot="title">프로필 수정</svelte:fragment>

  <form use:form>
    <input
      bind:this={fileEl}
      class="hidden"
      accept="image/jpeg,image/png"
      type="file"
      on:change={(e) => {
        if (e.currentTarget.files) {
          file = e.currentTarget.files[0];
          e.currentTarget.value = '';
          openThumbnailer = true;
        }
      }}
    />

    <button
      class="bg-primary square-80 rounded-6 flex flex-col center mb-3 overflow-hidden mx-auto"
      type="button"
      on:click={() => fileEl.showPicker()}
    >
      <Image class="square-full" $image={avatar} />
    </button>

    <FormField name="name" label="닉네임">
      <TextInput class="w-full font-bold" maxlength={10} placeholder="닉네임 입력">
        <span slot="right-icon" class="text-sm text-disabled">{$data.name.length} / 10</span>
      </TextInput>
    </FormField>

    <Button class="w-full mt-4" size="xl" type="submit">수정</Button>
  </form>
</Modal>

{#if file}
  <Modal size="md" bind:open={openThumbnailer}>
    <svelte:fragment slot="title">위치 조정</svelte:fragment>

    <Thumbnailer class="w-full" {file} bind:region />

    <Button slot="action" class="w-full mt-4" loading={$uploading} size="xl" on:click={uploadAvatar}>저장</Button>
  </Modal>
{/if}
