<script lang="ts">
  import clsx from 'clsx';
  import { page } from '$app/stores';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Button, Modal } from '$lib/components';
  import { FormField, Switch, TextInput } from '$lib/components/forms';
  import Image from '$lib/components/Image.svelte';
  import { ThumbnailPicker } from '$lib/components/media';
  import { createMutationForm } from '$lib/form';
  import { toast } from '$lib/notification';
  import { CreateSpaceSchema } from '$lib/validations';
  import type { EditorPage_CreateSpaceModal_user } from '$glitch';
  import type { SwitchSpace } from './types/switch-space';

  let _user: EditorPage_CreateSpaceModal_user;
  export { _user as $user };

  export let switchSpace: SwitchSpace;

  let useSpaceProfile = true;

  $: user = fragment(
    _user,
    graphql(`
      fragment EditorPage_CreateSpaceModal_user on User {
        id
        email

        profile {
          id
          name

          avatar {
            id
            ...Image_image
          }
        }
      }
    `),
  );

  export let open = false;

  let thumbnailPicker: ThumbnailPicker;

  let avatar: typeof $user.profile.avatar;
  $: avatar = $user.profile.avatar;

  $: if (open) {
    useSpaceProfile = true;
  }

  const { form, handleSubmit, isSubmitting, data, setFields, setInitialValues } = createMutationForm({
    mutation: graphql(`
      mutation EditorPage_CreateSpaceModal_CreateSpace_Mutation($input: CreateSpaceInput!) {
        createSpace(input: $input) {
          id
          slug
        }
      }
    `),
    schema: CreateSpaceSchema,
    initialValues: { profileName: '' },
    extra: () => ({ profileAvatarId: avatar.id }),
    onSuccess: async ({ id }) => {
      switchSpace({ id, emitSave: true });
      mixpanel.track('space:create', { useSpaceProfile, via: 'editor' });
      toast.success('스페이스를 만들었어요');
      open = false;
    },
  });

  $: setInitialValues({
    profileName: '',
    profileAvatarId: avatar.id,
    name: '',
    slug: '',
    isPublic: true,
  });

  $: if (!useSpaceProfile) {
    setFields('profileName', undefined);
    setFields('profileAvatarId', undefined);
  }
</script>

<Modal bind:open>
  <svelte:fragment slot="title">스페이스 만들기</svelte:fragment>

  <form class="space-y-3" use:form>
    <FormField name="name" label="스페이스 이름">
      <TextInput maxlength={20} placeholder="스페이스명">
        <span slot="right-icon" class="body-14-m text-disabled">{$data.name?.length}/20</span>
      </TextInput>
    </FormField>

    <FormField name="slug" label="스페이스 URL">
      <TextInput maxlength={20} placeholder="입력해주세요">
        <span slot="left-text">{$page.url.host}/</span>
        <span slot="right-icon" class="body-14-m text-disabled">{$data.slug?.length}/20</span>
      </TextInput>
    </FormField>

    <div class="space-y-4 py-2">
      <Switch class="flex items-center justify-between" bind:checked={useSpaceProfile}>
        <p class="body-16-b">스페이스 전용 프로필</p>
      </Switch>
    </div>

    <div class={clsx('flex gap-3', !useSpaceProfile && 'hidden!')}>
      <button
        class="bg-primary square-18.5 rounded-xl overflow-hidden shrink-0"
        type="button"
        on:click={() => thumbnailPicker.show()}
      >
        <Image class="square-full" $image={avatar} />
      </button>

      <FormField name="profileName" class="grow" label="스페이스 닉네임">
        <TextInput maxlength={20} placeholder="닉네임 입력">
          <span slot="right-icon" class="body-14-m text-disabled">{$data.profileName?.length ?? 0} / 20</span>
        </TextInput>
      </FormField>
    </div>
  </form>

  <Button slot="action" class="w-full" loading={$isSubmitting} size="xl" on:click={handleSubmit}>
    스페이스 만들기
  </Button>
</Modal>

<ThumbnailPicker bind:this={thumbnailPicker} on:change={(e) => (avatar = e.detail)} />
