<script lang="ts">
  import mixpanel from 'mixpanel-browser';
  import IconCamera from '~icons/tabler/camera';
  import { fragment, graphql } from '$bifrost';
  import { Alert, Icon, Image } from '$lib/components';
  import { ThumbnailPicker } from '$lib/components/media';
  import { Button, Modal } from '$lib/components/v2';
  import { FormField, TextInput } from '$lib/components/v2/forms';
  import { createMutationForm } from '$lib/form';
  import { UpdateSpaceCollectionSchema } from '$lib/validations';
  import { css } from '$styled-system/css';
  import { center } from '$styled-system/patterns';
  import type { UpdateCollectionModal_Collection_query } from '$bifrost';

  let thumbnailPicker: ThumbnailPicker;
  export let open = false;
  export let spaceId: string;

  let _collection: UpdateCollectionModal_Collection_query;
  export { _collection as $collection };

  let deleteCollectionOpen = false;

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

  const { form, setInitialValues, isSubmitting, data, handleSubmit } = createMutationForm({
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
    },
  });

  $: setInitialValues({
    spaceCollectionId: $collection.id,
    name: $collection.name,
    thumbnailId: $collection.thumbnail?.id,
  });

  const deleteSpaceCollection = graphql(`
    mutation UpdateCollectionModal_deleteSpaceCollection_Mutation($input: DeleteSpaceCollectionInput!) {
      deleteSpaceCollection(input: $input) {
        id
      }
    }
  `);
</script>

<Modal bind:open>
  <svelte:fragment slot="title">컬렉션 수정</svelte:fragment>

  <form use:form>
    <p class={css({ fontSize: '14px' })}>표지 이미지</p>

    <button
      class={css({
        position: 'relative',
        borderWidth: '1px',
        borderColor: 'gray.200',
        marginY: '8px',
        width: '100px',
        aspectRatio: '3/4',
        backgroundColor: 'gray.50',
        overflow: 'hidden',
      })}
      aria-describedby="upload-restriction"
      type="button"
      on:click={() => thumbnailPicker.show()}
    >
      <Image
        style={css.raw({ size: 'full', aspectRatio: '3/4', objectFit: 'cover' })}
        $image={thumbnail}
        placeholder
        size="full"
      />
      <div
        class={center({
          position: 'absolute',
          top: '1/2',
          left: '1/2',
          borderRadius: 'full',
          size: '32px',
          backgroundColor: 'gray.900/40',
          translate: 'auto',
          translateX: '-1/2',
          translateY: '-1/2',
          userSelect: 'none',
        })}
      >
        <Icon style={css.raw({ color: 'gray.50' })} icon={IconCamera} />
      </div>
    </button>
    <div id="upload-restriction" class={css({ fontSize: '13px', color: 'gray.500' })}>600x800 픽셀 이상 (3:4비율)</div>

    <FormField name="name" style={css.raw({ marginTop: '42px' })} label="컬렉션명">
      <TextInput style={css.raw({ width: 'full' })} maxlength={50} placeholder="컬렉션명을 입력해주세요" required>
        <span slot="right-icon" class={css({ fontSize: '13px', fontWeight: 'medium', color: 'gray.300' })}>
          {$data.name?.length}/50
        </span>
      </TextInput>
    </FormField>
  </form>

  <div slot="action" class={css({ width: 'full', textAlign: 'center' })}>
    <button
      class={css({ marginX: 'auto', marginBottom: '20px', color: 'red.600', fontSize: '14px' })}
      type="button"
      on:click={() => (deleteCollectionOpen = true)}
    >
      컬렉션 삭제
    </button>

    <Button style={css.raw({ width: 'full' })} loading={$isSubmitting} on:click={handleSubmit}>완료</Button>
  </div>
</Modal>

<ThumbnailPicker bind:this={thumbnailPicker} ratio="collection" on:change={(e) => (thumbnail = e.detail)} />

<Alert containerStyle={css.raw({ sm: { maxWidth: '460px' } })} bind:open={deleteCollectionOpen}>
  <svelte:fragment slot="title">컬렉션을 삭제할까요?</svelte:fragment>

  <svelte:fragment slot="action">
    <Button
      style={css.raw({ hideFrom: 'sm' })}
      size="lg"
      variant="gray-sub-fill"
      on:click={() => (deleteCollectionOpen = false)}
    >
      취소
    </Button>
    <Button
      style={css.raw({ hideBelow: 'sm' })}
      size="lg"
      variant="gray-outline"
      on:click={() => (deleteCollectionOpen = false)}
    >
      취소
    </Button>
    <Button
      size="lg"
      variant="red-fill"
      on:click={async () => {
        await deleteSpaceCollection({ spaceCollectionId: $collection.id });
        mixpanel.track('space:collection:delete', { spaceId, collectionId: $collection.id });
        deleteCollectionOpen = false;
        open = false;
      }}
    >
      삭제
    </Button>
  </svelte:fragment>
</Alert>
