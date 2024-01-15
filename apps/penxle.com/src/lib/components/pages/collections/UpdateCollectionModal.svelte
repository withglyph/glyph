<script lang="ts">
  import clsx from 'clsx';
  import mixpanel from 'mixpanel-browser';
  import { fragment, graphql } from '$glitch';
  import { Button, Image, Modal } from '$lib/components';
  import { FormField, TextInput } from '$lib/components/forms';
  import { ThumbnailPicker } from '$lib/components/media';
  import { createMutationForm } from '$lib/form';
  import { toast } from '$lib/notification';
  import { UpdateSpaceCollectionSchema } from '$lib/validations';
  import type { UpdateCollectionModal_Collection_query } from '$glitch';

  let thumbnailPicker: ThumbnailPicker;
  export let open = false;
  export let spaceId: string;

  let _collection: UpdateCollectionModal_Collection_query;

  export { _collection as $collection };

  $: collection = fragment(
    _collection,
    graphql(`
      fragment UpdateCollectionModal_Collection_query on SpaceCollection {
        id
        name
        thumbnail {
          id
          ...Image_image
        }
      }
    `),
  );

  let thumbnail: typeof $collection.thumbnail;
  $: thumbnail = $collection.thumbnail;

  const { form, setInitialValues, isSubmitting } = createMutationForm({
    mutation: graphql(`
      mutation UpdateSpaceCollectionModal_UpdateSpaceCollection_Mutation($input: UpdateSpaceCollectionInput!) {
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
    extra: () => ({ thumbnailId: thumbnail?.id }),
    onSuccess: ({ id }) => {
      open = false;
      mixpanel.track('space:collection:update', { spaceId, collectionId: id });
      toast.success('컬렉션이 수정되었어요');
    },
  });

  $: setInitialValues({ collectionId: $collection.id, name: $collection.name, thumbnailId: $collection.thumbnail?.id });
</script>

<Modal size="md" bind:open>
  <svelte:fragment slot="title">컬렉션 관리</svelte:fragment>
  <form use:form>
    <button
      class="bg-primary w-full aspect-3/4 rounded-6 flex flex-col center overflow-hidden mx-auto relative group"
      aria-describedby="upload-restriction"
      type="button"
      on:click={() => thumbnailPicker.show()}
    >
      {#if thumbnail}
        <Image class="square-full" $image={thumbnail} />
      {/if}
      <div
        class={clsx(
          'select-none absolute top-50% -translate-y-50% rounded-full square-15 bg-alphagray-50 flex center invisible group-hover:visible group-active:visible',
          thumbnail ? 'group-hover:visible group-active:visible' : 'visible!',
        )}
      >
        <i class="i-px-camera square-6 text-darkprimary" />
      </div>
    </button>
    <div id="upload-restriction" class="body-13-m text-disabled m-y-xs">JPG, PNG 업로드 가능</div>
    <FormField name="name" label="컬렉션명">
      <TextInput class="w-full font-bold" maxlength={20} required />
    </FormField>
    <Button class="w-full m-t-6" loading={$isSubmitting} size="xl" type="submit">컬렉션 수정하기</Button>
  </form>
</Modal>

<ThumbnailPicker bind:this={thumbnailPicker} ratio="rectangle" on:change={(e) => (thumbnail = e.detail)} />
