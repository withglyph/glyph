<script lang="ts">
  import { fragment, graphql } from '$glitch';
  import { Button, Image, Modal } from '$lib/components';
  import { FormField, TextInput } from '$lib/components/forms';
  import { ThumbnailPicker } from '$lib/components/media';
  import { createMutationForm } from '$lib/form';
  import { toast } from '$lib/notification';
  import { UpdateSpaceProfileSchema } from '$lib/validations';
  import type { SpaceSettingLayout_UpdateSpaceProfileModal_query } from '$glitch';

  let _query: SpaceSettingLayout_UpdateSpaceProfileModal_query;
  export { _query as $query };
  export let open = false;

  let thumbnailPicker: ThumbnailPicker;

  $: query = fragment(
    _query,
    graphql(`
      fragment SpaceSettingLayout_UpdateSpaceProfileModal_query on Query {
        me @_required {
          id
        }

        space(slug: $slug) {
          id

          meAsMember @_required {
            id

            profile {
              id
              name

              avatar {
                id
                ...Image_image
              }
            }
          }
        }
      }
    `),
  );

  let avatar: typeof $query.space.meAsMember.profile.avatar;
  $: avatar = $query.space.meAsMember.profile.avatar;

  const { form, data, setInitialValues } = createMutationForm({
    mutation: graphql(`
      mutation SpaceSettingLayout_UpdateSpaceProfileModal_UpdateSpaceProfile_Mutation(
        $input: UpdateSpaceProfileInput!
      ) {
        updateSpaceProfile(input: $input) {
          profile {
            id
            name

            avatar {
              id
            }
          }
        }
      }
    `),
    schema: UpdateSpaceProfileSchema,
    extra: () => ({ profileAvatarId: avatar.id }),
    onSuccess: () => {
      open = false;
      toast.success('프로필이 수정되었어요.');
    },
  });

  $: setInitialValues({
    profileName: $query.space.meAsMember.profile.name,
    profileAvatarId: $query.space.meAsMember.profile.avatar.id,
    spaceId: $query.space.id,
  });
</script>

<Modal bind:open>
  <svelte:fragment slot="title">스페이스 전용 프로필 수정</svelte:fragment>
  <svelte:fragment slot="subtitle">스페이스에서만 보여질 프로필을 설정해요</svelte:fragment>

  <form use:form>
    <button
      class="bg-primary square-full max-w-95.5 rounded-6 flex flex-col center mb-3 overflow-hidden mx-auto"
      type="button"
      on:click={() => thumbnailPicker.show()}
    >
      <Image class="square-full" $image={avatar} />
    </button>

    <FormField name="profileName" label="닉네임">
      <TextInput class="w-full font-bold" maxlength={20} placeholder="닉네임 입력">
        <span slot="right-icon" class="body-14-m text-disabled">{$data.profileName?.length ?? 0} / 20</span>
      </TextInput>
    </FormField>

    <div class="mt-4 flex gap-3">
      <Button class="grow-0" color="tertiary" size="xl" variant="outlined">프로필 랜덤</Button>
      <Button class="grow-1" size="xl" type="submit">프로필 저장하기</Button>
    </div>
  </form>
</Modal>

<ThumbnailPicker bind:this={thumbnailPicker} on:change={(e) => (avatar = e.detail)} />
