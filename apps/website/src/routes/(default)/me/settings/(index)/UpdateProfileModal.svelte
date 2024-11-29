<script lang="ts">
  import IconCamera from '~icons/tabler/camera';
  import { fragment, graphql } from '$glitch';
  import { analytics } from '$lib/analytics';
  import { Button, Icon, Image, Modal } from '$lib/components';
  import { FormField, TextInput } from '$lib/components/forms';
  import { ThumbnailPicker } from '$lib/components/media';
  import { createMutationForm } from '$lib/form';
  import { UpdateUserProfileSchema } from '$lib/validations';
  import { css } from '$styled-system/css';
  import { center } from '$styled-system/patterns';
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

  const { form, data, setInitialValues, isSubmitting, handleSubmit } = createMutationForm({
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
      analytics.track('user:profile:update');
      open = false;
    },
  });

  $: setInitialValues({
    avatarId: avatar.id,
    name: $profile.name,
  });
</script>

<Modal bind:open>
  <svelte:fragment slot="title">프로필 수정</svelte:fragment>

  <form use:form>
    <p class={css({ fontSize: '14px' })}>프로필 이미지</p>
    <button
      class={center({
        position: 'relative',
        flexDirection: 'column',
        marginY: '8px',
        borderWidth: '1px',
        borderColor: 'gray.200',
        backgroundColor: 'gray.50',
        size: '100px',
      })}
      type="button"
      on:click={() => thumbnailPicker.show()}
    >
      <Image style={css.raw({ size: 'full' })} $image={avatar} size={512} />
      <div
        class={center({
          userSelect: 'none',
          position: 'absolute',
          top: '1/2',
          translate: 'auto',
          translateY: '-1/2',
          borderRadius: 'full',
          backgroundColor: 'gray.900/50',
          size: '32px',
        })}
      >
        <Icon style={css.raw({ color: 'gray.0' })} icon={IconCamera} />
      </div>
    </button>
    <p class={css({ fontSize: '13px', color: 'gray.500' })}>800x800 픽셀 이상 (1:1 비율)</p>

    <FormField name="name" style={css.raw({ marginTop: '42px' })} label="이름">
      <TextInput maxlength={20} placeholder="프로필 이름을 입력해주세요">
        <span
          slot="right-icon"
          class={css({ flex: 'none', fontSize: '14px', fontWeight: 'medium', color: 'gray.300' })}
        >
          {$data.name.length} / 20
        </span>
      </TextInput>
    </FormField>
  </form>

  <Button
    slot="action"
    style={css.raw({ width: 'full' })}
    loading={$isSubmitting}
    size="lg"
    type="submit"
    on:click={handleSubmit}
  >
    수정
  </Button>
</Modal>

<ThumbnailPicker bind:this={thumbnailPicker} on:change={(e) => (avatar = e.detail)} />
