<script lang="ts">
  import IconCamera from '~icons/tabler/camera';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { graphql } from '$glitch';
  import { analytics } from '$lib/analytics';
  import { Alert, Button, Helmet, Icon, Image } from '$lib/components';
  import { FormField, TextArea, TextInput } from '$lib/components/forms';
  import { ThumbnailPicker } from '$lib/components/media';
  import { createMutationForm } from '$lib/form';
  import { toast } from '$lib/notification';
  import { SetSpaceSchema } from '$lib/validations';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import DeleteSpaceModal from './DeleteSpaceModal.svelte';

  let thumbnailPicker: ThumbnailPicker;
  let spaceProfileThumbnailPicker: ThumbnailPicker;
  let deleteSpaceOpen = false;
  let changeSpaceVisibilityOpen = false;

  $: query = graphql(`
    query SpaceDashboardSettingsPage_Query($slug: String!) {
      space(slug: $slug) {
        id
        slug
        name
        description
        visibility

        icon {
          id
          ...Image_image
        }

        meAsMember @_required {
          id
          role

          profile {
            id
            name

            avatar {
              id
              ...Image_image
            }
          }
        }

        ...SpaceDashboardSettingsPage_DeleteSpaceModal_space
      }
    }
  `);

  let icon: typeof $query.space.icon;
  $: icon = $query.space.icon;

  let avatar: typeof $query.space.meAsMember.profile.avatar;
  $: avatar = $query.space.meAsMember.profile.avatar;

  const { form, data, setInitialValues } = createMutationForm({
    mutation: graphql(`
      mutation SpaceDashboardSettingsPage_SetSpace_Mutation($input: SetSpaceInput!) {
        setSpace(input: $input) {
          id
          slug
          name
          description
          visibility

          icon {
            id
            ...Image_image
          }

          meAsMember {
            id
            role

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
    schema: SetSpaceSchema,
    extra: () => ({
      iconId: icon.id,
      profileAvatarId: avatar.id,
      isPublic: $query.space.visibility === 'PUBLIC',
    }),
    onSuccess: async () => {
      analytics.track('space:update', { spaceId: $query.space.id });
      toast.success('스페이스 정보가 수정되었어요');
      await goto(`/${$data.slug}/dashboard/settings`);
    },
    onError: (resp) => {
      // @ts-expect-error form validation error
      toast.error(resp.message);
    },
  });

  $: setInitialValues({
    spaceId: $query.space.id,
    iconId: $query.space.icon.id,
    name: $query.space.name,
    slug: $query.space.slug,
    description: $query.space.description ?? '',
    isPublic: $query.space.visibility === 'PUBLIC',
    profileName: $query.space.meAsMember.profile.name,
    profileAvatarId: $query.space.meAsMember.profile.avatar.id,
  });

  const updateSpace = graphql(`
    mutation SpaceDashboardSettingsPage_UpdateSpace_Mutation($input: UpdateSpaceInput!) {
      updateSpace(input: $input) {
        id
        visibility
      }
    }
  `);
</script>

<Helmet description={`${$query.space.name} 스페이스 설정`} title={`설정 | ${$query.space.name}`} />

<div class={css({ sm: { maxWidth: '600px' } })}>
  <h1 class={css({ marginBottom: '32px', fontSize: '24px', fontWeight: 'bold', hideBelow: 'sm' })}>스페이스</h1>

  <form class={flex({ direction: 'column', gap: '40px' })} use:form>
    <input name="spaceId" type="hidden" value={$query.space.id} />

    <div>
      <h2
        class={css({
          marginBottom: { base: '4px', sm: '12px' },
          fontSize: { base: '15px', sm: '17px' },
          fontWeight: 'semibold',
        })}
      >
        스페이스 대표 이미지
      </h2>

      <button
        class={css({
          position: 'relative',
          size: '150px',
          overflow: 'hidden',
        })}
        type="button"
        on:click={() => thumbnailPicker.show()}
      >
        <Image style={css.raw({ size: 'full' })} $image={icon} size={256} />
        <div
          class={css({
            position: 'absolute',
            top: '1/2',
            left: '1/2',
            translate: 'auto',
            translateX: '-1/2',
            translateY: '-1/2',
            borderRadius: 'full',
            padding: '6px',
            backgroundColor: 'gray.900/60',
          })}
        >
          <Icon style={css.raw({ color: 'gray.0' })} icon={IconCamera} size={20} />
        </div>
      </button>
    </div>

    <div>
      <h2 class={css({ marginBottom: '6px', fontSize: { base: '15px', sm: '17px' }, fontWeight: 'semibold' })}>
        스페이스 이름
      </h2>

      <FormField name="name" style={css.raw({ flexGrow: '1' })} hideLabel label="스페이스 이름">
        <TextInput
          style={css.raw({ width: 'full' })}
          maxlength={20}
          placeholder="스페이스 이름을 입력해주세요"
          size="sm"
        >
          <span slot="right-icon" class={css({ color: 'gray.600' })}>
            {$data.name?.length ?? 0}/20
          </span>
        </TextInput>
      </FormField>
    </div>

    <div>
      <h2 class={css({ marginBottom: '4px', fontSize: { base: '15px', sm: '17px' }, fontWeight: 'semibold' })}>
        스페이스 전용 프로필
      </h2>
      <p class={css({ marginBottom: '8px', fontSize: '12px', color: 'gray.500' })}>
        해당 스페이스에서만 이용할 별도의 스페이스 프로필을 설정할 수 있어요. <br />
        스페이스 프로필을 이용할 경우 다른 이용자들은 각 프로필이 같은 사람인지 알 수 없어요.
      </p>

      <div class={flex({ align: 'center', gap: '14px' })}>
        <button
          class={css({
            flex: 'none',
            position: 'relative',
            borderRadius: 'full',
            size: '64px',
            overflow: 'hidden',
          })}
          type="button"
          on:click={() => spaceProfileThumbnailPicker.show()}
        >
          <Image style={css.raw({ size: 'full' })} $image={avatar} size={256} />
          <div
            class={css({
              position: 'absolute',
              top: '1/2',
              left: '1/2',
              translate: 'auto',
              translateX: '-1/2',
              translateY: '-1/2',
              borderRadius: 'full',
              padding: '6px',
              backgroundColor: 'gray.900/60',
            })}
          >
            <Icon style={css.raw({ color: 'gray.0' })} icon={IconCamera} size={20} />
          </div>
        </button>

        <FormField
          name="profileName"
          style={css.raw({ marginTop: '19px', flexGrow: '1' })}
          hideLabel
          label="스페이스 전용 프로필 이름"
        >
          <TextInput
            style={css.raw({ width: 'full' })}
            maxlength={20}
            placeholder="스페이스 전용 프로필 이름을 입력해주세요"
            size="sm"
          >
            <span slot="right-icon" class={css({ color: 'gray.600' })}>
              {$data.profileName?.length ?? 0}/20
            </span>
          </TextInput>
        </FormField>
      </div>
    </div>

    {#if $query.space.visibility === 'PRIVATE'}
      <div>
        <h2 class={css({ marginBottom: '4px', fontSize: { base: '15px', sm: '17px' }, fontWeight: 'semibold' })}>
          스페이스 공개
        </h2>

        <p class={css({ marginBottom: '12px', fontSize: '12px', color: 'gray.500' })}>
          스페이스를 공개설정할 경우 다시 비공개 스페이스로 돌아갈 수 없어요
        </p>

        <Button
          style={css.raw({ width: 'full' })}
          variant="gray-sub-fill"
          on:click={() => (changeSpaceVisibilityOpen = true)}
        >
          공개 스페이스로 전환
        </Button>
      </div>
    {/if}

    <div>
      <h2 class={css({ marginBottom: '6px', fontSize: { base: '15px', sm: '17px' }, fontWeight: 'semibold' })}>
        스페이스 소개
      </h2>

      <FormField name="description" hideLabel label="스페이스 소개">
        <TextArea maxlength={200} placeholder="스페이스를 간단하게 소개해보세요" rows={4}>
          <span
            slot="right-icon"
            class={css({ fontSize: '13px', fontWeight: 'medium', color: 'gray.600', textAlign: 'right' })}
          >
            {$data.description?.length ?? 0}/200
          </span>
        </TextArea>
      </FormField>
    </div>

    <div>
      <h2 class={css({ marginBottom: '6px', fontSize: { base: '15px', sm: '17px' }, fontWeight: 'semibold' })}>
        스페이스 고유 URL
      </h2>

      <FormField name="slug" hideLabel label="스페이스 고유 URL">
        <div class={css({ display: 'flex' })}>
          <div
            class={flex({
              align: 'center',
              borderWidth: '1px',
              borderColor: 'gray.100',
              borderRightStyle: 'none',
              paddingX: '12px',
              paddingY: '10px',
              fontSize: '14px',
              fontWeight: 'medium',
              color: 'gray.400',
              backgroundColor: 'gray.50',
              height: '37px',
            })}
          >
            {$page.url.host}/
          </div>
          <TextInput
            style={css.raw({ width: 'full' })}
            maxlength={20}
            placeholder="스페이스 고유 URL을 입력해주세요"
            size="sm"
          >
            <span slot="right-icon" class={css({ color: 'gray.600' })}>
              {$data.slug?.length ?? 0}/20
            </span>
          </TextInput>
        </div>
      </FormField>
    </div>

    <div>
      <Button style={css.raw({ width: 'full' })} type="submit" variant="gradation-fill">스페이스 수정</Button>
      {#if $query.space.meAsMember?.role === 'ADMIN'}
        <Button
          style={css.raw({ marginTop: '24px', outlineWidth: '0!' })}
          variant="red-outline"
          on:click={() => (deleteSpaceOpen = true)}
        >
          스페이스 삭제
        </Button>
      {/if}
    </div>
  </form>
</div>

<DeleteSpaceModal $space={$query.space} bind:open={deleteSpaceOpen} />

<ThumbnailPicker bind:this={thumbnailPicker} on:change={(e) => (icon = e.detail)} />
<ThumbnailPicker bind:this={spaceProfileThumbnailPicker} on:change={(e) => (avatar = e.detail)} />

<Alert bind:open={changeSpaceVisibilityOpen}>
  <p slot="title" class={css({ textAlign: 'left' })}>정말 스페이스를 공개하시겠어요?</p>

  <p slot="content" class={css({ textAlign: 'left' })}>
    스페이스를 공개설정할 경우 다시 비공개 스페이스로 돌아갈 수 없어요
  </p>

  <svelte:fragment slot="action">
    <Button
      style={css.raw({ hideFrom: 'sm' })}
      size="lg"
      variant="gray-sub-fill"
      on:click={() => (changeSpaceVisibilityOpen = false)}
    >
      취소
    </Button>
    <Button
      style={css.raw({ hideBelow: 'sm' })}
      size="lg"
      variant="gray-outline"
      on:click={() => (changeSpaceVisibilityOpen = false)}
    >
      취소
    </Button>
    <Button
      size="lg"
      variant="brand-fill"
      on:click={async () => {
        await updateSpace({ spaceId: $query.space.id, isPublic: true });
        analytics.track('space:update:visibility', { spaceId: $query.space.id, isPublic: true });
        changeSpaceVisibilityOpen = false;
      }}
    >
      공개
    </Button>
  </svelte:fragment>
</Alert>
