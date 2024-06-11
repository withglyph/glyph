<script lang="ts">
  import mixpanel from 'mixpanel-browser';
  import { createEventDispatcher } from 'svelte';
  import IconCamera from '~icons/tabler/camera';
  import { graphql } from '$glitch';
  import { Button, Icon, Image, Modal } from '$lib/components';
  import { FormField, TextArea, TextInput } from '$lib/components/forms';
  import { ThumbnailPicker } from '$lib/components/media';
  import { createMutationForm } from '$lib/form';
  import { CreateSpaceCollectionSchema } from '$lib/validations';
  import { css } from '$styled-system/css';
  import { center } from '$styled-system/patterns';
  import type { Image_image } from '$glitch';

  let thumbnailPicker: ThumbnailPicker;
  export let open = false;
  export let spaceId: string;

  let thumbnail: (Image_image & { id: string }) | null = null;

  $: if (open) {
    thumbnail = null;
  }

  const dispatch = createEventDispatcher<{
    success: { id: string; name: string; thumbnail: (Image_image & { id: string }) | null };
  }>();

  const { form, data, isSubmitting, handleSubmit } = createMutationForm({
    mutation: graphql(`
      mutation CreateSpaceCollectionModal_CreateSpaceCollection_Mutation($input: CreateSpaceCollectionInput!) {
        createSpaceCollection(input: $input) {
          id
          name
          description

          thumbnail {
            id
            ...Image_image
          }
        }
      }
    `),
    schema: CreateSpaceCollectionSchema,
    extra: () => ({ thumbnailId: thumbnail?.id }),
    onSuccess: ({ id, name }) => {
      open = false;
      mixpanel.track('space:collection:create', { spaceId, collectionId: id });
      dispatch('success', { id, name, thumbnail });
    },
  });
</script>

<Modal bind:open>
  <svelte:fragment slot="title">컬렉션 만들기</svelte:fragment>

  <form use:form>
    <input name="spaceId" type="hidden" value={spaceId} />

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
        size={256}
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

    <div id="upload-restriction" class={css({ fontSize: '13px', color: 'gray.500' })}>600x800 픽셀 이상 (3:4 비율)</div>

    <FormField name="name" style={css.raw({ marginTop: '32px' })} label="컬렉션명">
      <TextInput style={css.raw({ width: 'full' })} maxlength={50} placeholder="컬렉션명을 입력해주세요" required>
        <span slot="right-icon" class={css({ fontSize: '13px', fontWeight: 'medium', color: 'gray.300' })}>
          {$data.name?.length}/50
        </span>
      </TextInput>
    </FormField>

    <FormField name="description" style={css.raw({ marginTop: '22px' })} label="설명">
      <TextArea maxlength={200} placeholder="컬렉션을 간단하게 소개해보세요" rows={3}>
        <span
          slot="right-icon"
          class={css({ fontSize: '13px', fontWeight: 'medium', color: 'gray.300', textAlign: 'right' })}
        >
          {$data.description?.length}/200
        </span>
      </TextArea>
    </FormField>
  </form>

  <Button slot="action" style={css.raw({ width: 'full' })} loading={$isSubmitting} size="lg" on:click={handleSubmit}>
    완료
  </Button>
</Modal>

<ThumbnailPicker bind:this={thumbnailPicker} ratio="collection" on:change={(e) => (thumbnail = e.detail)} />
