<script lang="ts">
  import clsx from 'clsx';
  import mixpanel from 'mixpanel-browser';
  import { graphql } from '$glitch';
  import { Button, Image, Modal } from '$lib/components';
  import { FormField, TextInput } from '$lib/components/forms';
  import { ThumbnailPicker } from '$lib/components/media';
  import { createMutationForm } from '$lib/form';
  import { toast } from '$lib/notification';
  import { UpdateSpaceCollectionSchema } from '$lib/validations';
  import type { Image_image } from '$glitch';

  let thumbnailPicker: ThumbnailPicker;
  export let open = false;
  export let spaceId: string;

  let thumbnail: (Image_image & { id: string }) | null = null;

  $: if (open) {
    thumbnail = null;
  }

  const createSpaceCollection = graphql(`
    mutation CreateCollectionModal_CreateSpaceCollection_Mutation($input: CreateSpaceCollectionInput!) {
      createSpaceCollection(input: $input) {
        id
        name
      }
    }
  `);

  const { form, isSubmitting } = createMutationForm({
    mutation: graphql(`
      mutation CreateSpaceCollectionModal_UpdateSpaceCollection_Mutation($input: UpdateSpaceCollectionInput!) {
        updateSpaceCollection(input: $input) {
          id
          name
          thumbnail {
            ...Image_image
          }
        }
      }
    `),
    schema: UpdateSpaceCollectionSchema,
    extra: async () => {
      const defaultName = '_';
      const createdCollection = await createSpaceCollection({ spaceId, name: defaultName });

      return { collectionId: createdCollection.id, thumbnailId: thumbnail?.id };
    },
    initialValues: {
      collectionId: '',
    },
    onSuccess: ({ id }) => {
      open = false;
      mixpanel.track('space:collection:create', { spaceId, collectionId: id });
      toast.success('컬렉션이 생성되었어요');
    },
  });
</script>

<Modal size="md" bind:open>
  <svelte:fragment slot="title">새 컬렉션 생성</svelte:fragment>
  <form use:form>
    <button
      class="bg-primary w-20.8125rem h-26rem rounded-6 flex flex-col center overflow-hidden mx-auto relative group"
      aria-describedby="upload-restriction"
      type="button"
      on:click={() => thumbnailPicker.show()}
    >
      {#if thumbnail}
        <Image class="square-full" $image={thumbnail} />
      {/if}
      <div
        class={clsx(
          'select-none absolute top-50% -translate-y-50% rounded-full square-15 bg-alphagray-50 flex center invisible',
          thumbnail ? 'group-hover:visible group-active:visible' : 'visible!',
        )}
      >
        <i class="i-px-camera square-6 text-darkprimary" />
      </div>
    </button>
    <div id="upload-restriction" class="body-13-m text-disabled m-y-xs">JPG, PNG 업로드 가능</div>
    <FormField name="name" label="컬렉션명">
      <TextInput class="w-full" maxlength={20} placeholder="이름" required />
    </FormField>
    <Button class="w-full m-t-6" loading={$isSubmitting} size="xl" type="submit">컬렉션 생성하기</Button>
  </form>
</Modal>

<ThumbnailPicker bind:this={thumbnailPicker} ratio="rectangle" on:change={(e) => (thumbnail = e.detail)} />
