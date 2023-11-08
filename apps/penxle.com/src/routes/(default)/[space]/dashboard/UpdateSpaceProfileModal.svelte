<script lang="ts">
  import { fragment, graphql } from '$glitch';
  import { Button, Image, Modal } from '$lib/components';
  import { FormField, Switch, TextInput } from '$lib/components/forms';
  import { ThumbnailPicker } from '$lib/components/media';
  import { createMutationForm } from '$lib/form';
  import { toast } from '$lib/notification';
  import { UpdateSpaceProfileSchema } from '$lib/validations';
  import type { SpaceDashboardLayout_UpdateSpaceProfileModal_query } from '$glitch';

  let _query: SpaceDashboardLayout_UpdateSpaceProfileModal_query;
  export { _query as $query };
  export let open = false;

  let thumbnailPicker: ThumbnailPicker;
  let useSpaceProfile = true;

  $: query = fragment(
    _query,
    graphql(`
      fragment SpaceDashboardLayout_UpdateSpaceProfileModal_query on Query {
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

  const { form, handleSubmit, data, setInitialValues } = createMutationForm({
    mutation: graphql(`
      mutation SpaceSettingLayout_UpdateSpaceProfileModal_UpdateSpaceProfile_Mutation(
        $input: UpdateSpaceProfileInput!
      ) {
        updateSpaceProfile(input: $input) {
          id

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
      toast.success('프로필이 수정되었어요');
    },
  });

  $: setInitialValues({
    profileName: $query.space.meAsMember.profile.name,
    profileAvatarId: $query.space.meAsMember.profile.avatar.id,
    spaceId: $query.space.id,
  });

  const deleteSpaceProfile = graphql(`
    mutation SpaceSettingLayout_UpdateSpaceProfileModal_DeleteSpaceProfile_Mutation($input: DeleteSpaceProfileInput!) {
      deleteSpaceProfile(input: $input) {
        id

        profile {
          id
          name

          avatar {
            id
          }
        }
      }
    }
  `);
</script>

<Modal bind:open>
  <svelte:fragment slot="title">스페이스 전용 프로필 수정</svelte:fragment>
  <svelte:fragment slot="subtitle">스페이스에서만 보여질 프로필을 설정해요</svelte:fragment>

  <form use:form>
    <div class="flex items-center justify-between mb-4">
      <span class="body-16-b">스페이스 전용 프로필</span>
      <Switch bind:checked={useSpaceProfile} />
    </div>
    {#if useSpaceProfile}
      <div class="flex gap-3 w-full">
        <button
          class="bg-primary square-19.25 rounded-xl flex center overflow-hidden"
          type="button"
          on:click={() => thumbnailPicker.show()}
        >
          <Image class="square-full" $image={avatar} />
        </button>

        <FormField name="profileName" class="grow" label="닉네임">
          <TextInput maxlength={20} placeholder="닉네임 입력">
            <span slot="right-icon" class="body-14-m text-disabled">{$data.profileName?.length ?? 0} / 20</span>
          </TextInput>
        </FormField>
      </div>
    {/if}

    <Button
      class="mt-4 w-full"
      size="xl"
      on:click={async () => {
        if (useSpaceProfile) {
          handleSubmit();
        } else {
          await deleteSpaceProfile({ spaceId: $query.space.id });
          open = false;
        }
      }}
    >
      프로필 저장하기
    </Button>
  </form>
</Modal>

<ThumbnailPicker bind:this={thumbnailPicker} on:change={(e) => (avatar = e.detail)} />
