<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import IconCamera from '~icons/tabler/camera';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Icon, Image } from '$lib/components';
  import { ThumbnailPicker } from '$lib/components/media';
  import { Button, Modal } from '$lib/components/v2';
  import { FormField, TextInput } from '$lib/components/v2/forms';
  import { createMutationForm } from '$lib/form';
  import { CreateSpaceSchema } from '$lib/validations';
  import { css } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';
  import type { CreateSpaceModal_user, Image_image } from '$glitch';

  let _user: CreateSpaceModal_user;
  export { _user as $user };

  let thumbnailPicker: ThumbnailPicker;

  export let open = false;
  export let via: 'user-menu' | 'space-list-menu' | 'editor' = 'user-menu';
  let icon: (Image_image & { id: string }) | null = null;

  $: if (open) {
    icon = null;
  }

  const dispatch = createEventDispatcher<{ create: { id: string } }>();

  $: user = fragment(
    _user,
    graphql(`
      fragment CreateSpaceModal_user on User {
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

  const { form, data, setInitialValues, isSubmitting, handleSubmit } = createMutationForm({
    mutation: graphql(`
      mutation CreateSpaceModal_CreateSpace_Mutation($input: CreateSpaceInput!) {
        createSpace(input: $input) {
          id
          slug
        }
      }
    `),
    schema: CreateSpaceSchema,
    initialValues: { profileName: '' },
    extra: () => ({ iconId: icon?.id }),
    onSuccess: async ({ id, slug }) => {
      dispatch('create', { id });

      mixpanel.track('space:create', { useSpaceProfile: true, via });
      open = false;

      if (via === 'user-menu') {
        await goto(`/${slug}`);
      } else if (via === 'space-list-menu') {
        await goto(`/${slug}/dashboard/settings`);
      }
    },
  });

  $: setInitialValues({
    profileName: $user.profile.name,
    profileAvatarId: $user.profile.avatar.id,
    name: '',
    slug: '',
    isPublic: true,
    iconId: '',
  });
</script>

<Modal bind:open>
  <svelte:fragment slot="title">스페이스 만들기</svelte:fragment>

  <form use:form>
    <FormField name="name" style={css.raw({ marginBottom: '8px' })} label="스페이스명">
      <TextInput maxlength={20} placeholder="스페이스명을 입력해주세요">
        <span slot="right-icon" class={css({ fontSize: '14px', fontWeight: 'medium', color: 'gray.300' })}>
          {$data.name?.length}/20
        </span>
      </TextInput>
    </FormField>

    <FormField name="slug" style={css.raw({ marginBottom: '24px' })} label="스페이스 URL">
      <TextInput maxlength={20} placeholder="입력해주세요">
        <span slot="left-icon" class={css({ fontSize: '14px', color: 'gray.400' })}>{$page.url.host}/</span>
        <span slot="right-icon" class={css({ fontSize: '14px', fontWeight: 'medium', color: 'gray.300' })}>
          {$data.slug?.length}/20
        </span>
      </TextInput>
    </FormField>

    <div class={flex({ direction: 'column', gap: '8px' })}>
      <p class={css({ fontSize: '14px' })}>
        스페이스 표지 이미지
        <span class={css({ color: 'gray.400' })}>(선택)</span>
      </p>

      <button
        class={css({
          position: 'relative',
          borderWidth: '1px',
          borderColor: 'gray.200',
          backgroundColor: 'gray.50',
          size: '100px',
          _hover: {
            '& > div': {
              visibility: 'visible',
            },
          },
        })}
        type="button"
        on:click={() => thumbnailPicker.show()}
      >
        <Image style={css.raw({ size: 'full' })} $image={icon} placeholder />

        <div
          class={center({
            position: 'absolute',
            top: '1/2',
            left: '1/2',
            translate: 'auto',
            translateX: '-1/2',
            translateY: '-1/2',
            borderRadius: 'full',
            backgroundColor: 'gray.900/40',
            size: '32px',
            visibility: 'hidden',
          })}
        >
          <Icon style={css.raw({ color: 'gray.5' })} icon={IconCamera} />
        </div>
      </button>

      <p class={css({ fontSize: '13px', color: 'gray.500' })}>800x800 픽셀 이상 (1:1 비율)</p>
    </div>

    <hr
      class={css({ borderStyle: 'none', marginY: '16px', marginX: '-20px', backgroundColor: 'gray.50', height: '8px' })}
    />

    <div class={css({ display: 'flex', gap: '12px' })}>
      <FormField name="profileName" style={css.raw({ flexGrow: '1' })} label="이름">
        <TextInput maxlength={20} placeholder="프로필명을 입력해주세요">
          <span slot="right-icon" class={css({ fontSize: '14px', fontWeight: 'medium', color: 'gray.300' })}>
            {$data.profileName?.length ?? 0}/20
          </span>
        </TextInput>
      </FormField>
    </div>
  </form>

  <Button slot="action" style={css.raw({ width: 'full' })} loading={$isSubmitting} size="lg" on:click={handleSubmit}>
    완료
  </Button>
</Modal>

<ThumbnailPicker bind:this={thumbnailPicker} on:change={(e) => (icon = e.detail)} />
