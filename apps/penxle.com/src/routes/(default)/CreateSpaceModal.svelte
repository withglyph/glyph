<script lang="ts">
  import ky from 'ky';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Button, Modal } from '$lib/components';
  import { FormField, Switch, TextInput } from '$lib/components/forms';
  import Image from '$lib/components/Image.svelte';
  import { Thumbnailer } from '$lib/components/media';
  import { createMutationForm } from '$lib/form';
  import { toast } from '$lib/notification';
  import { trackable } from '$lib/svelte/store';
  import { CreateSpaceSchema } from '$lib/validations';
  import type { DefaultLayout_CreateSpaceModal_user } from '$glitch';
  import type { Region } from '$lib/components/media';

  let _user: DefaultLayout_CreateSpaceModal_user;
  export { _user as $user };

  $: user = fragment(
    _user,
    graphql(`
      fragment DefaultLayout_CreateSpaceModal_user on User {
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

  let region: Region | undefined = undefined;
  let file: File | null = null;
  let fileEl: HTMLInputElement;
  let openThumbnailer = false;
  const uploading = trackable();

  let avatar: typeof $user.profile.avatar;
  $: avatar = $user.profile.avatar;

  const { form, handleSubmit, isSubmitting, data, setFields, setInitialValues } = createMutationForm({
    mutation: graphql(`
      mutation DefaultLayout_CreateSpaceModal_CreateSpace_Mutation($input: CreateSpaceInput!) {
        createSpace(input: $input) {
          id
          slug
        }
      }
    `),
    schema: CreateSpaceSchema,
    initialValues: { profileName: '' },
    extra: () => ({ profileAvatarId: avatar.id }),
    onSuccess: async ({ slug }) => {
      mixpanel.track('space:create');
      toast.success('스페이스를 만들었어요.');
      await goto(`/${slug}`);
    },
  });

  const prepareImageUpload = graphql(`
    mutation DefaultLayout_CreateSpaceModal_PrepareImageUpload_Mutation {
      prepareImageUpload {
        key
        presignedUrl
      }
    }
  `);

  const finalizeImageUpload = graphql(`
    mutation DefaultLayout_CreateSpaceModal_FinalizeImageUpload_Mutation($input: FinalizeImageUploadInput!) {
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

  $: setInitialValues({
    profileName: '',
    profileAvatarId: avatar.id,
    name: '',
    slug: '',
    isPublic: true,
  });

  $: useSpaceProfile = $data.profileName !== $user.profile.name || $data.profileAvatarId !== avatar.id;

  const handleCheckedChange = (event: Event) => {
    const { checked } = event.currentTarget as HTMLInputElement;

    if (!checked) {
      setFields('profileName', $user.profile.name);
      setFields('profileAvatarId', $user.profile.avatar.id);
    }
  };
</script>

<Modal bind:open>
  <svelte:fragment slot="title">스페이스 만들기</svelte:fragment>

  <form class="space-y-3" use:form>
    <FormField name="name" label="스페이스 이름">
      <TextInput maxlength={20} placeholder="스페이스명">
        <span slot="right-icon">{$data.name?.length}/20</span>
      </TextInput>
    </FormField>

    <FormField name="slug" label="스페이스 URL">
      <TextInput maxlength={20} placeholder="입력해주세요">
        <span slot="left-text">{$page.url.host}/</span>
        <span slot="right-icon">{$data.slug?.length}/20</span>
      </TextInput>
    </FormField>

    <div class="space-y-4 py-2">
      <div class="flex items-center justify-between">
        <p class="body-16-b">스페이스 공개</p>
        <Switch name="isPublic" />
      </div>
      <div class="flex items-center justify-between">
        <p class="body-16-b">스페이스 전용 프로필</p>
        <Switch checked={useSpaceProfile} on:change={handleCheckedChange} />
      </div>
      {#if useSpaceProfile}
        <p class="text-3.5 text-gray-50">스페이스 내에서만 사용되는 프로필이에요</p>
      {/if}
    </div>

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

    <div class="flex gap-3">
      <button
        class="bg-primary square-18.5 rounded-xl overflow-hidden grow-0"
        type="button"
        on:click={() => fileEl.showPicker()}
      >
        <Image class="square-full" $image={avatar} />
      </button>

      <FormField name="profileName" class="grow" label="스페이스 닉네임">
        <TextInput maxlength={20} placeholder="닉네임 입력">
          <span slot="right-icon" class="body-14-sb text-gray-40">{$data.profileName?.length} / 20</span>
        </TextInput>
      </FormField>
    </div>
  </form>

  <Button slot="action" class="w-full" loading={$isSubmitting} size="xl" on:click={handleSubmit}>
    스페이스 만들기
  </Button>
</Modal>

{#if file}
  <Modal bind:open={openThumbnailer}>
    <svelte:fragment slot="title">위치 조정</svelte:fragment>

    <Thumbnailer class="w-full" {file} bind:region />

    <Button slot="action" class="w-full" loading={$uploading} size="xl" on:click={uploadAvatar}>저장</Button>
  </Modal>
{/if}
