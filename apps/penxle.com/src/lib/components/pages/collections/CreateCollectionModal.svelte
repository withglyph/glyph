<script lang="ts">
  import mixpanel from 'mixpanel-browser';
  import IconCamera from '~icons/tabler/camera';
  import { graphql } from '$glitch';
  import { Icon, Image } from '$lib/components';
  import { ThumbnailPicker } from '$lib/components/media';
  import { Button, Modal } from '$lib/components/v2';
  import { FormField, TextInput } from '$lib/components/v2/forms';
  import { createMutationForm } from '$lib/form';
  import { UpdateSpaceCollectionSchema } from '$lib/validations';
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

  const createSpaceCollection = graphql(`
    mutation CreateCollectionModal_CreateSpaceCollection_Mutation($input: CreateSpaceCollectionInput!) {
      createSpaceCollection(input: $input) {
        id
        name
      }
    }
  `);

  const { form, data, isSubmitting, handleSubmit } = createMutationForm({
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

      return { spaceCollectionId: createdCollection.id, thumbnailId: thumbnail?.id };
    },
    initialValues: {
      spaceCollectionId: '',
    },
    onSuccess: ({ id }) => {
      open = false;
      mixpanel.track('space:collection:create', { spaceId, collectionId: id });
    },
  });
</script>

<Modal bind:open>
  <svelte:fragment slot="title">컬렉션 만들기</svelte:fragment>
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

        _hover: {
          '& > div': {
            visibility: 'visible',
          },
        },
      })}
      aria-describedby="upload-restriction"
      type="button"
      on:click={() => thumbnailPicker.show()}
    >
      <Image style={css.raw({ size: 'full', aspectRatio: '3/4' })} $image={thumbnail} placeholder />

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
          visibility: 'hidden',
        })}
      >
        <Icon style={css.raw({ color: 'gray.50' })} icon={IconCamera} />
      </div>
    </button>

    <div id="upload-restriction" class={css({ fontSize: '13px', color: 'gray.500' })}>800x1000 픽셀 이상 (4:5비율)</div>

    <FormField name="name" style={css.raw({ marginTop: '42px' })} label="컬렉션명">
      <TextInput style={css.raw({ width: 'full' })} maxlength={20} placeholder="컬렉션명을 입력해주세요" required>
        <span slot="right-icon" class={css({ fontSize: '13px', fontWeight: 'medium', color: 'gray.300' })}>
          {$data.name?.length}/20
        </span>
      </TextInput>
    </FormField>
  </form>

  <Button slot="action" style={css.raw({ width: 'full' })} loading={$isSubmitting} size="lg" on:click={handleSubmit}>
    완료
  </Button>
</Modal>

<ThumbnailPicker bind:this={thumbnailPicker} ratio="collection" on:change={(e) => (thumbnail = e.detail)} />
