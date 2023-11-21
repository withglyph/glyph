<script lang="ts">
  import { fragment, graphql } from '$glitch';
  import { Button, Image, Modal } from '$lib/components';
  import { FormField, TextInput } from '$lib/components/forms';
  import { ThumbnailPicker } from '$lib/components/media';
  import { createMutationForm } from '$lib/form';
  import { toast } from '$lib/notification';
  import { UpdateUserProfileSchema } from '$lib/validations';
  import type { MeSettingsPage_UpdateProfileModal_profile } from '$glitch';

  let _profile: MeSettingsPage_UpdateProfileModal_profile;
  export { _profile as $profile };
  export let open = false;

  let thumbnailPicker: ThumbnailPicker;

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
      toast.success('프로필이 수정되었어요');
    },
  });

  $: setInitialValues({
    avatarId: avatar.id,
    name: $profile.name,
  });
</script>

<Modal size="md" bind:open>
  <svelte:fragment slot="title">프로필 수정</svelte:fragment>

  <form use:form>
    <button
      class="bg-primary square-80 rounded-6 flex flex-col center mb-3 overflow-hidden mx-auto relative [&>div]:hover:(flex center)"
      type="button"
      on:click={() => thumbnailPicker.show()}
    >
      <Image class="square-full" $image={avatar} />
      <div class="select-none absolute top-50% -translate-y-50% rounded-full square-15 bg-alphagray-50 hidden">
        <i class="i-px-camera square-6 text-darkprimary" />
      </div>
    </button>

    <FormField name="name" label="닉네임">
      <TextInput class="w-full font-bold" maxlength={20} placeholder="닉네임 입력">
        <span slot="right-icon" class="body-14-m text-disabled">{$data.name.length} / 20</span>
      </TextInput>
    </FormField>

    <Button class="w-full mt-4" size="xl" type="submit">수정</Button>
  </form>
</Modal>

<ThumbnailPicker bind:this={thumbnailPicker} on:change={(e) => (avatar = e.detail)} />
