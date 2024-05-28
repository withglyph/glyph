<script lang="ts">
  import IconCamera from '~icons/tabler/camera';
  import { goto } from '$app/navigation';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Alert, Helmet, Icon, Image } from '$lib/components';
  import { TextArea } from '$lib/components/forms';
  import { ThumbnailPicker } from '$lib/components/media';
  import { Button } from '$lib/components/v2';
  import { FormField, TextInput } from '$lib/components/v2/forms';
  import { createMutationForm } from '$lib/form';
  import { UpdateSpaceCollectionSchema } from '$lib/validations';
  import { css } from '$styled-system/css';
  import { center } from '$styled-system/patterns';

  let thumbnailPicker: ThumbnailPicker;
  let deleteCollectionOpen = false;

  $: query = graphql(`
    query SpaceDashboardCollectionsEntityPage_Query($slug: String!) {
      spaceCollection(slug: $slug) {
        id
        name
        description

        thumbnail {
          id
          ...Image_image
        }

        space {
          id
          slug
          name
        }
      }
    }
  `);

  let thumbnail: typeof $query.spaceCollection.thumbnail;
  $: thumbnail = $query.spaceCollection.thumbnail;

  const { form, setInitialValues, data } = createMutationForm({
    mutation: graphql(`
      mutation SpaceDashboardCollectionsEntityPage_UpdateSpaceCollection_Mutation($input: UpdateSpaceCollectionInput!) {
        updateSpaceCollection(input: $input) {
          id
          name

          thumbnail {
            id
            ...Image_image
          }
        }
      }
    `),
    schema: UpdateSpaceCollectionSchema,
    extra: () => ({ thumbnailId: thumbnail?.id }),
    onSuccess: ({ id }) => {
      mixpanel.track('space:collection:update', { spaceId: $query.spaceCollection.space.id, collectionId: id });
    },
  });

  $: setInitialValues({
    spaceCollectionId: $query.spaceCollection.id,
    name: $query.spaceCollection.name,
    thumbnailId: $query.spaceCollection.thumbnail?.id,
    description: $query.spaceCollection.description ?? '',
  });

  const deleteSpaceCollection = graphql(`
    mutation SpaceDashboardCollectionsEntityPage_deleteSpaceCollection_Mutation($input: DeleteSpaceCollectionInput!) {
      deleteSpaceCollection(input: $input) {
        id
      }
    }
  `);
</script>

<Helmet
  description={`${$query.spaceCollection.space.name} 스페이스의 ${$query.spaceCollection.name} 컬렉션`}
  title={`${$query.spaceCollection.space.name}의 ${$query.spaceCollection.name}`}
/>

<form
  class={css({ marginTop: { base: '20px', sm: '32px' }, paddingX: { smDown: '20px' }, maxWidth: '500px' })}
  use:form
>
  <h3
    class={css({
      marginBottom: { base: '6px', sm: '8px' },
      fontSize: { base: '15px', sm: '17px' },
      fontWeight: 'semibold',
    })}
  >
    컬렉션 대표 이미지
  </h3>

  <button
    class={css({
      position: 'relative',
      borderWidth: '1px',
      borderColor: 'gray.200',
      marginBottom: '6px',
      width: '118px',
      aspectRatio: '3/4',
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

  <p class={css({ fontSize: '13px', color: 'gray.500' })}>추천 사이즈 : 600X800픽셀 이상 (3:4 비율)</p>

  <h3
    class={css({
      marginTop: '40px',
      marginBottom: '6px',
      fontSize: { base: '15px', sm: '17px' },
      fontWeight: 'semibold',
    })}
  >
    컬렉션명
  </h3>

  <FormField name="name" hideLabel label="컬렉션명">
    <TextInput style={css.raw({ width: 'full' })} maxlength={50} placeholder="컬렉션명을 입력해주세요" required>
      <span slot="right-icon" class={css({ fontSize: '13px', fontWeight: 'medium', color: 'gray.300' })}>
        {$data.name?.length}/50
      </span>
    </TextInput>
  </FormField>

  <h3
    class={css({
      marginTop: '40px',
      marginBottom: '6px',
      fontSize: { base: '15px', sm: '17px' },
      fontWeight: 'semibold',
    })}
  >
    설명
  </h3>

  <TextArea name="description" maxlength={200} placeholder="컬렉션을 간단하게 소개해보세요" rows={3}>
    <span
      slot="right-icon"
      class={css({ fontSize: '13px', fontWeight: 'medium', color: 'gray.300', textAlign: 'right' })}
    >
      {$data.description?.length}/200
    </span>
  </TextArea>

  <Button style={css.raw({ marginY: '24px', width: 'full' })} type="submit" variant="gradation-fill">
    컬렉션 수정
  </Button>
</form>

<button
  class={css({
    paddingY: '9px',
    paddingX: { smDown: '20px' },
    paddingRight: '12px',
    fontSize: '13px',
    fontWeight: 'medium',
    color: 'red.600',
    width: 'fit',
  })}
  type="button"
  on:click={() => (deleteCollectionOpen = true)}
>
  컬렉션 삭제
</button>

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
        await deleteSpaceCollection({ spaceCollectionId: $query.spaceCollection.id });
        mixpanel.track('space:collection:delete', {
          spaceId: $query.spaceCollection.space.id,
          collectionId: $query.spaceCollection.id,
        });
        deleteCollectionOpen = false;
        await goto(`/${$query.spaceCollection.space.slug}/dashboard/collections`);
      }}
    >
      삭제
    </Button>
  </svelte:fragment>
</Alert>

<ThumbnailPicker bind:this={thumbnailPicker} ratio="collection" on:change={(e) => (thumbnail = e.detail)} />
