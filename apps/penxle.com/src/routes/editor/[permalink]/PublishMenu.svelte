<script lang="ts">
  import { onMount } from 'svelte';
  import { slide } from 'svelte/transition';
  import IconCheckmark from '~icons/effit/checkmark';
  import IconDot from '~icons/effit/dot';
  import IconGlobe from '~icons/effit/globe';
  import IconLink from '~icons/effit/link';
  import IconUsers from '~icons/effit/users';
  import IconAlertCircle from '~icons/tabler/alert-circle';
  import IconAlertTriangle from '~icons/tabler/alert-triangle';
  import IconCaretDownFilled from '~icons/tabler/caret-down-filled';
  import IconCaretUpFilled from '~icons/tabler/caret-up-filled';
  import IconPhoto from '~icons/tabler/photo';
  import IconPlus from '~icons/tabler/plus';
  import IconTrash from '~icons/tabler/trash';
  import IconX from '~icons/tabler/x';
  import { goto } from '$app/navigation';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Icon, Image, SegmentButtonGroup, ToggleButton, Tooltip } from '$lib/components';
  import { Checkbox, FormValidationMessage, Switch } from '$lib/components/forms';
  import ThumbnailPicker from '$lib/components/media/ThumbnailPicker.svelte';
  import { CreateCollectionModal } from '$lib/components/pages/collections';
  import { Button } from '$lib/components/v2';
  import { createMutationForm } from '$lib/form';
  import { PublishPostInputSchema } from '$lib/validations/post';
  import { css } from '$styled-system/css';
  import { center, flex, grid } from '$styled-system/patterns';
  import CreateSpaceModal from '../../(default)/CreateSpaceModal.svelte';
  import { getEditorContext } from './context';
  import PublishMenuSearch from './PublishMenuSearch.svelte';
  import RadioGroup from './RadioGroup.svelte';
  import type { ChangeEventHandler } from 'svelte/elements';
  import type { EditorPage_PublishMenu_post, EditorPage_PublishMenu_query, Image_image, PostPair } from '$glitch';

  export { _post as $post, _query as $query };
  let _post: EditorPage_PublishMenu_post;
  let _query: EditorPage_PublishMenu_query;
  export let open = false;

  const { forceSave } = getEditorContext();

  $: query = fragment(
    _query,
    graphql(`
      fragment EditorPage_PublishMenu_query on Query {
        me @_required {
          id

          personalIdentity {
            id
          }

          spaces {
            id
            name
            slug
            visibility

            icon {
              id
              ...Image_image
            }

            collections {
              id
              name

              thumbnail {
                id
                ...Image_image
              }
            }
          }

          posts(state: DRAFT) {
            id
          }

          ...CreateSpaceModal_user
        }
      }
    `),
  );

  $: post = fragment(
    _post,
    graphql(`
      fragment EditorPage_PublishMenu_post on Post {
        id
        permalink
        state
        discloseStats
        hasPassword
        receiveFeedback
        receivePatronage
        receiveTagContribution
        protectContent
        visibility
        category
        pairs
        externalSearchable
        ageRating
        commentQualification

        thumbnail {
          id
          ...Image_image
        }

        space {
          id
        }

        tags {
          id
          kind

          tag {
            id
            name
          }
        }

        draftRevision {
          id
        }

        collection {
          id
        }

        ...EditorPage_RevisionListModal_Post
      }
    `),
  );

  const { form, data, setInitialValues, handleSubmit, isSubmitting } = createMutationForm({
    mutation: graphql(`
      mutation EditorPage_PublishMenu_PublishPost_Mutation($input: PublishPostInput!) {
        publishPost(input: $input) {
          id
          permalink
          discloseStats
          receiveFeedback
          receivePatronage
          receiveTagContribution
          protectContent
          visibility

          space @_required {
            id
            slug
          }
        }
      }
    `),
    schema: PublishPostInputSchema,
    extra: async () => {
      const revisionId = await forceSave();
      return {
        revisionId,
        spaceId: selectedSpaceId,
        collectionId: selectedCollectionId,
        thumbnailId: currentThumbnail?.id,
      };
    },
    onSuccess: async (resp) => {
      mixpanel.track('post:publish', { postId: resp.id });
      await goto(`/${resp.space.slug}/${resp.permalink}`);
    },
  });

  $: setInitialValues({
    revisionId: $post.draftRevision.id,
    spaceId: $post.space ? $post.space.id : '',
    collectionId: $post.collection ? $post.collection.id : undefined,
    thumbnailId: $post.thumbnail?.id,
    visibility: $post.visibility,
    password: $post.hasPassword ? '' : undefined,
    ageRating: $post.ageRating,
    externalSearchable: $post.externalSearchable,
    discloseStats: $post.discloseStats,
    receiveFeedback: $post.receiveFeedback,
    receivePatronage: $post.receivePatronage,
    receiveTagContribution: $post.receiveTagContribution,
    protectContent: $post.protectContent,
    commentQualification: $post.commentQualification,
    category: $post.category,
    pairs: $post.pairs ?? [],
    tags: $post.tags.map((t) => ({ name: t.tag.name, kind: t.kind })),
  });

  let enablePassword = false;
  let createSpaceOpen = false;
  let createCollectionOpen = false;

  $: if ($post?.hasPassword) {
    enablePassword = true;
  }

  let selectedSpaceId: string | undefined = undefined;

  $: selectedSpace = $query.me.spaces.find((space) => space.id === selectedSpaceId);

  let spaceSelectorOpen = false;
  let collectionSelectorOpen = false;

  let tabIndex = 0;
  let selectedCollectionId: string | undefined = undefined;

  $: selectedCollection = selectedSpace?.collections.find((collection) => collection.id === selectedCollectionId);

  let titleQuery = '';
  let characterQuery = '';
  let couplingQuery = '';
  let triggerQuery = '';
  let extraQuery = '';

  let thumbnailPicker: ThumbnailPicker;

  let thumbnail: ({ id: string } & Image_image) | null | undefined = undefined;
  $: currentThumbnail = thumbnail === undefined ? $post.thumbnail : thumbnail;

  const checkPair = (e: Parameters<ChangeEventHandler<HTMLInputElement>>[0], pair: PostPair) => {
    const { checked } = e.currentTarget;

    $data.pairs = checked ? ($data.pairs ? [...$data.pairs, pair] : [pair]) : $data.pairs?.filter((v) => v !== pair);
  };

  onMount(() => {
    selectedSpaceId = $post.space?.id;
    selectedCollectionId = $post.collection?.id;
  });
</script>

<div
  class={css(
    {
      backgroundColor: 'gray.5',
      zIndex: '50',
      smDown: {
        borderTopRadius: '14px',
        width: 'full',
        boxShadow: '[0 8px 24px 0 {colors.gray.900/28}]',
      },
      sm: {
        borderWidth: '1px',
        borderColor: 'gray.200',
        borderTopWidth: '0',
        borderBottomRadius: '8px',
        boxShadow: '[0 5px 22px 0 {colors.gray.900/6}]',
      },
    },
    !open && { display: 'none' },
  )}
>
  <div
    class={css({
      borderBottomWidth: '1px',
      borderBottomColor: { base: 'gray.100', sm: 'gray.200' },
      paddingX: '24px',
      paddingY: '16px',
    })}
  >
    <p class={css({ fontWeight: 'semibold', smDown: { position: 'relative', textAlign: 'center' } })}>
      게시 옵션
      <button
        class={css({ position: 'absolute', right: '0', hideFrom: 'sm' })}
        type="button"
        on:click={() => (open = false)}
      >
        <Icon icon={IconX} size={24} />
      </button>
    </p>
    <span class={css({ marginTop: '2px', fontSize: '12px', color: 'gray.500', hideBelow: 'sm' })}>
      다양한 옵션을 선택해 원하는 방식으로 게시글을 업로드할 수 있어요
    </span>
  </div>

  <div class={flex({ smDown: { flexDirection: 'column' } })}>
    <div
      class={flex({
        smDown: {
          gap: '28px',
          paddingX: '20px',
          paddingY: '16px',
          width: 'full',
          whiteSpace: 'nowrap',
          overflowX: 'auto',
        },
        sm: {
          flexDirection: 'column',
          gap: '6px',
          borderRightWidth: '1px',
          borderRightColor: 'gray.200',
          paddingY: '6px',
          width: '208px',
        },
      })}
    >
      <button
        class={flex({
          align: 'center',
          textAlign: 'left',
          smDown: {
            borderBottomWidth: '2px',
            borderBottomColor: 'gray.5',
            fontSize: '15px',
            fontWeight: 'semibold',
            color: 'gray.300',
            _pressed: { borderBottomColor: 'gray.900', color: 'gray.900' },
          },
          sm: {
            fontSize: '13px',
            borderRadius: '4px',
            marginX: '8px',
            paddingY: '4px',
            _hover: { backgroundColor: 'gray.50' },
            _pressed: { backgroundColor: 'gray.50' },
          },
        })}
        aria-pressed={tabIndex === 0}
        type="button"
        on:click={() => (tabIndex = 0)}
      >
        {#if selectedSpaceId || $post.space}
          <Icon style={css.raw({ color: 'teal.500', hideBelow: 'sm' })} icon={IconCheckmark} size={24} />
        {:else}
          <Icon style={css.raw({ color: 'red.600', hideBelow: 'sm' })} icon={IconDot} size={24} />
        {/if}
        <span class={css({ width: 'full', paddingBottom: '8px', sm: { paddingX: '4px', paddingY: '8px' } })}>발행</span>
      </button>

      <button
        class={flex({
          align: 'center',
          textAlign: 'left',
          smDown: {
            borderBottomWidth: '2px',
            borderBottomColor: 'gray.5',
            fontSize: '15px',
            fontWeight: 'semibold',
            color: 'gray.300',
            _pressed: { borderBottomColor: 'gray.900', color: 'gray.900' },
          },
          sm: {
            fontSize: '13px',
            borderRadius: '4px',
            marginX: '8px',
            paddingY: '4px',
            _hover: { backgroundColor: 'gray.50' },
            _pressed: { backgroundColor: 'gray.50' },
          },
        })}
        aria-pressed={tabIndex === 1}
        type="button"
        on:click={() => (tabIndex = 1)}
      >
        {#if $data.tags?.length > 0}
          <Icon style={css.raw({ color: 'teal.500', hideBelow: 'sm' })} icon={IconCheckmark} size={24} />
        {:else}
          <Icon style={css.raw({ color: 'gray.300', hideBelow: 'sm' })} icon={IconCheckmark} size={24} />
        {/if}
        <span class={css({ width: 'full', paddingBottom: '8px', sm: { paddingX: '4px', paddingY: '8px' } })}>태그</span>
      </button>
      <button
        class={flex({
          align: 'center',
          textAlign: 'left',
          smDown: {
            borderBottomWidth: '2px',
            borderBottomColor: 'gray.5',
            fontSize: '15px',
            fontWeight: 'semibold',
            color: 'gray.300',
            _pressed: { borderBottomColor: 'gray.900', color: 'gray.900' },
          },
          sm: {
            fontSize: '13px',
            borderRadius: '4px',
            marginX: '8px',
            paddingY: '4px',
            _hover: { backgroundColor: 'gray.50' },
            _pressed: { backgroundColor: 'gray.50' },
          },
        })}
        aria-pressed={tabIndex === 2}
        type="button"
        on:click={() => (tabIndex = 2)}
      >
        {#if currentThumbnail}
          <Icon style={css.raw({ color: 'teal.500', hideBelow: 'sm' })} icon={IconCheckmark} size={24} />
        {:else}
          <Icon style={css.raw({ color: 'gray.300', hideBelow: 'sm' })} icon={IconCheckmark} size={24} />
        {/if}
        <span class={css({ width: 'full', paddingBottom: '8px', sm: { paddingX: '4px', paddingY: '8px' } })}>
          썸네일
        </span>
      </button>
      <button
        class={flex({
          align: 'center',
          textAlign: 'left',
          smDown: {
            borderBottomWidth: '2px',
            borderBottomColor: 'gray.5',
            fontSize: '15px',
            fontWeight: 'semibold',
            color: 'gray.300',
            _pressed: { borderBottomColor: 'gray.900', color: 'gray.900' },
          },
          sm: {
            fontSize: '13px',
            borderRadius: '4px',
            marginX: '8px',
            paddingY: '4px',
            _hover: { backgroundColor: 'gray.50' },
            _pressed: { backgroundColor: 'gray.50' },
          },
        })}
        aria-pressed={tabIndex === 3}
        type="button"
        on:click={() => (tabIndex = 3)}
      >
        <Icon style={css.raw({ color: 'teal.500', hideBelow: 'sm' })} icon={IconCheckmark} size={24} />
        <span class={css({ width: 'full', paddingBottom: '8px', sm: { paddingX: '4px', paddingY: '8px' } })}>
          대상 독자
        </span>
      </button>
      <button
        class={flex({
          align: 'center',
          textAlign: 'left',
          smDown: {
            borderBottomWidth: '2px',
            borderBottomColor: 'gray.5',
            fontSize: '15px',
            fontWeight: 'semibold',
            color: 'gray.300',
            _pressed: { borderBottomColor: 'gray.900', color: 'gray.900' },
          },
          sm: {
            fontSize: '13px',
            borderRadius: '4px',
            marginX: '8px',
            paddingY: '4px',
            _hover: { backgroundColor: 'gray.50' },
            _pressed: { backgroundColor: 'gray.50' },
          },
        })}
        aria-pressed={tabIndex === 4}
        type="button"
        on:click={() => (tabIndex = 4)}
      >
        <Icon style={css.raw({ color: 'teal.500', hideBelow: 'sm' })} icon={IconCheckmark} size={24} />
        <span class={css({ width: 'full', paddingBottom: '8px', sm: { paddingX: '4px', paddingY: '8px' } })}>댓글</span>
      </button>
      <button
        class={flex({
          align: 'center',
          textAlign: 'left',
          smDown: {
            borderBottomWidth: '2px',
            borderBottomColor: 'gray.5',
            fontSize: '15px',
            fontWeight: 'semibold',
            color: 'gray.300',
            _pressed: { borderBottomColor: 'gray.900', color: 'gray.900' },
          },
          sm: {
            fontSize: '13px',
            borderRadius: '4px',
            marginX: '8px',
            paddingY: '4px',
            _hover: { backgroundColor: 'gray.50' },
            _pressed: { backgroundColor: 'gray.50' },
          },
        })}
        aria-pressed={tabIndex === 5}
        type="button"
        on:click={() => (tabIndex = 5)}
      >
        <Icon style={css.raw({ color: 'teal.500', hideBelow: 'sm' })} icon={IconCheckmark} size={24} />
        <span class={css({ width: 'full', paddingBottom: '8px', sm: { paddingX: '4px', paddingY: '8px' } })}>
          세부 옵션
        </span>
      </button>
    </div>

    <form
      class={css({
        overflowY: 'auto',
        smDown: { paddingX: '20px', paddingBottom: '32px', width: 'full', height: '[50vh]' },
        sm: { paddingX: '24px', paddingY: '20px', width: '384px', height: '432px' },
      })}
      use:form
    >
      <input name="thumbnailId" type="hidden" value={currentThumbnail?.id} />

      <div
        class={css({ display: 'flex', flexDirection: 'column', gap: '32px' }, tabIndex !== 0 && { display: 'none' })}
      >
        <div>
          <p
            class={flex({
              gap: '4px',
              paddingTop: '4px',
              paddingBottom: '8px',
              fontSize: { base: '15px', sm: '14px' },
              fontWeight: { base: 'medium', sm: 'semibold' },
            })}
          >
            스페이스
          </p>

          <div class={css({ position: 'relative' })}>
            <Tooltip
              enabled={$post.state === 'PUBLISHED'}
              message="이미 게시한 포스트는 스페이스를 바꿀 수 없어요"
              offset={16}
              placement="top"
            >
              <button
                class={css(
                  {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderWidth: '1px',
                    borderColor: 'gray.200',
                    borderRadius: '6px',
                    padding: '12px',
                    width: 'full',
                    backgroundColor: { _hover: 'gray.50', _disabled: 'gray.50' },
                  },
                  spaceSelectorOpen && { borderBottomRadius: '[0!]' },
                )}
                disabled={$post.state === 'PUBLISHED'}
                type="button"
                on:click={() => (spaceSelectorOpen = true)}
              >
                {#if selectedSpace}
                  <div class={flex({ align: 'center', gap: '8px' })}>
                    <Image
                      style={css.raw({ flex: 'none', borderRadius: '2px', size: '24px' })}
                      $image={selectedSpace.icon}
                    />
                    <span class={css({ fontSize: '13px', fontWeight: 'medium', truncate: true })}>
                      {selectedSpace.name}
                    </span>
                  </div>
                {:else}
                  <span class={css({ fontSize: '13px', color: 'gray.500' })}>스페이스를 선택해주세요</span>
                {/if}

                <p class={center({ size: '24px' })}>
                  {#if spaceSelectorOpen}
                    <Icon icon={IconCaretUpFilled} />
                  {:else}
                    <Icon icon={IconCaretDownFilled} />
                  {/if}
                </p>
              </button>
            </Tooltip>

            {#if spaceSelectorOpen}
              <div
                class={css({ position: 'fixed', inset: '0', zIndex: '50' })}
                role="button"
                tabindex="-1"
                on:click={() => (spaceSelectorOpen = false)}
                on:keypress={null}
              />

              <ul
                class={css({
                  position: 'absolute',
                  top: '48px',
                  left: '0',
                  borderWidth: '1px',
                  borderColor: 'gray.200',
                  borderBottomRadius: '6px',
                  width: 'full',
                  backgroundColor: 'gray.5',
                  zIndex: '50',
                })}
                transition:slide={{ axis: 'y', duration: 250 }}
              >
                {#each $query.me.spaces as space (space.id)}
                  <li class={css({ borderBottomWidth: '1px', borderBottomColor: 'gray.200' })}>
                    <button
                      class={flex({
                        justify: 'space-between',
                        align: 'center',
                        padding: '12px',
                        width: 'full',
                        _hover: { backgroundColor: 'gray.100' },
                      })}
                      type="button"
                      on:click={() => {
                        if (selectedSpaceId !== space.id) {
                          selectedCollectionId = undefined;
                        }

                        selectedSpaceId = space.id;
                        spaceSelectorOpen = false;
                      }}
                    >
                      <div class={flex({ align: 'center', gap: '8px' })}>
                        <Image
                          style={css.raw({ flex: 'none', borderRadius: '2px', size: '24px' })}
                          $image={space.icon}
                        />
                        <span class={css({ fontSize: '13px', fontWeight: 'medium', truncate: true })}>
                          {space.name}
                        </span>
                      </div>
                    </button>
                  </li>
                {/each}
                <li>
                  <button
                    class={flex({
                      justify: 'space-between',
                      align: 'center',
                      borderBottomRadius: '6px',
                      padding: '12px',
                      width: 'full',
                      fontSize: '13px',
                      fontWeight: 'medium',
                      _hover: { backgroundColor: 'gray.100' },
                    })}
                    type="button"
                    on:click={() => (createSpaceOpen = true)}
                  >
                    새로운 스페이스 추가하기
                    <Icon style={css.raw({ color: 'gray.400' })} icon={IconPlus} size={24} />
                  </button>
                </li>
              </ul>
            {/if}
          </div>
        </div>

        <div>
          <p
            class={flex({
              gap: '4px',
              paddingTop: '4px',
              paddingBottom: '8px',
              fontSize: { base: '15px', sm: '14px' },
              fontWeight: { base: 'medium', sm: 'semibold' },
            })}
          >
            컬렉션
          </p>

          <div class={css({ position: 'relative' })}>
            <button
              class={css(
                {
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderWidth: '1px',
                  borderColor: 'gray.200',
                  borderRadius: '6px',
                  padding: '12px',
                  width: 'full',
                  backgroundColor: { _hover: 'gray.100', _disabled: 'gray.100' },
                },
                collectionSelectorOpen && { borderBottomRadius: '[0!]' },
              )}
              disabled={!selectedSpace}
              type="button"
              on:click={() => (collectionSelectorOpen = true)}
            >
              {#if selectedCollection}
                <span class={css({ fontSize: '13px', fontWeight: 'medium', truncate: true })}>
                  {selectedCollection.name}
                </span>
              {:else}
                <span class={css({ fontSize: '13px', color: 'gray.500' })}>컬렉션을 선택해주세요</span>
              {/if}

              <p class={center({ size: '24px' })}>
                {#if collectionSelectorOpen}
                  <Icon icon={IconCaretUpFilled} />
                {:else}
                  <Icon icon={IconCaretDownFilled} />
                {/if}
              </p>
            </button>

            {#if collectionSelectorOpen && selectedSpace?.collections}
              <div
                class={css({ position: 'fixed', inset: '0', zIndex: '50' })}
                role="button"
                tabindex="-1"
                on:click={() => (collectionSelectorOpen = false)}
                on:keypress={null}
              />

              <ul
                class={css({
                  position: 'absolute',
                  top: '48px',
                  left: '0',
                  borderWidth: '1px',
                  borderColor: 'gray.200',
                  borderBottomRadius: '6px',
                  width: 'full',
                  backgroundColor: 'gray.5',
                  zIndex: '50',
                })}
                transition:slide={{ axis: 'y', duration: 250 }}
              >
                {#if selectedCollectionId !== undefined}
                  <li class={css({ borderBottomWidth: '1px', borderBottomColor: 'gray.200' })}>
                    <button
                      class={flex({
                        justify: 'space-between',
                        align: 'center',
                        padding: '12px',
                        width: 'full',
                        _hover: { backgroundColor: 'gray.100' },
                      })}
                      type="button"
                      on:click={() => {
                        selectedCollectionId = undefined;
                        collectionSelectorOpen = false;
                      }}
                    >
                      <span class={css({ fontSize: '13px', fontWeight: 'medium', truncate: true })}>선택 안함</span>
                    </button>
                  </li>
                {/if}
                {#each selectedSpace?.collections as collection (collection.id)}
                  <li class={css({ borderBottomWidth: '1px', borderBottomColor: 'gray.200' })}>
                    <button
                      class={flex({
                        justify: 'space-between',
                        align: 'center',
                        padding: '12px',
                        width: 'full',
                        _hover: { backgroundColor: 'gray.100' },
                      })}
                      type="button"
                      on:click={() => {
                        selectedCollectionId = collection.id;
                        collectionSelectorOpen = false;
                      }}
                    >
                      <span class={css({ fontSize: '13px', fontWeight: 'medium', truncate: true })}>
                        {collection.name}
                      </span>
                    </button>
                  </li>
                {/each}
                <li>
                  <button
                    class={flex({
                      justify: 'space-between',
                      align: 'center',
                      borderBottomRadius: '6px',
                      padding: '12px',
                      width: 'full',
                      fontSize: '13px',
                      fontWeight: 'medium',
                      _hover: { backgroundColor: 'gray.100' },
                    })}
                    type="button"
                    on:click={() => (createCollectionOpen = true)}
                  >
                    새로운 컬렉션 추가하기
                    <Icon style={css.raw({ color: 'gray.400' })} icon={IconPlus} size={24} />
                  </button>
                </li>
              </ul>
            {/if}
          </div>
        </div>
      </div>

      <div
        class={css({ display: 'flex', flexDirection: 'column', gap: '32px' }, tabIndex !== 1 && { display: 'none' })}
      >
        <div>
          <p
            class={flex({
              gap: '4px',
              paddingTop: '4px',
              paddingBottom: '8px',
              fontSize: { base: '15px', sm: '14px' },
              fontWeight: { base: 'medium', sm: 'semibold' },
            })}
          >
            카테고리
          </p>

          <SegmentButtonGroup>
            <ToggleButton name="category" type="radio" value="ORIGINAL">오리지널</ToggleButton>
            <ToggleButton name="category" type="radio" value="FANFICTION">2차창작</ToggleButton>
            <ToggleButton name="category" type="radio" value="NONFICTION">비문학</ToggleButton>
            <ToggleButton name="category" type="radio" value="OTHER">기타</ToggleButton>
          </SegmentButtonGroup>
        </div>

        <div>
          <p
            class={flex({
              gap: '4px',
              paddingTop: '4px',
              paddingBottom: '8px',
              fontSize: { base: '15px', sm: '14px' },
              fontWeight: { base: 'medium', sm: 'semibold' },
            })}
          >
            <span>페어</span>
            <Tooltip style={center.raw()} message="중복 선택하거나 아무것도 선택하지 않을 수 있어요" placement="top">
              <Icon style={css.raw({ color: 'gray.400' })} icon={IconAlertCircle} />
            </Tooltip>
          </p>

          <div class={grid({ columns: 4, gap: '9px' })}>
            <ToggleButton checked={$data.pairs?.includes('BL')} on:change={(e) => checkPair(e, 'BL')}>BL</ToggleButton>
            <ToggleButton checked={$data.pairs?.includes('GL')} on:change={(e) => checkPair(e, 'GL')}>GL</ToggleButton>
            <ToggleButton checked={$data.pairs?.includes('HL')} on:change={(e) => checkPair(e, 'HL')}>HL</ToggleButton>
            <ToggleButton checked={$data.pairs?.includes('NONCP')} on:change={(e) => checkPair(e, 'NONCP')}>
              Non-CP
            </ToggleButton>
            <ToggleButton checked={$data.pairs?.includes('OTHER')} on:change={(e) => checkPair(e, 'OTHER')}>
              그 외
            </ToggleButton>
          </div>
        </div>

        <PublishMenuSearch
          kind="TITLE"
          label="작품"
          placeholder="예) 마법소녀_펜슬이"
          tooltip="여러 명칭을 쓸 수 있어요"
          bind:tags={$data.tags}
          bind:query={titleQuery}
        />

        <PublishMenuSearch
          kind="CHARACTER"
          label="캐릭터"
          placeholder="예) 펜슬이"
          tooltip="등장 캐릭터가 너무 많다면 주연만 써도 좋아요"
          bind:tags={$data.tags}
          bind:query={characterQuery}
        />

        <PublishMenuSearch
          kind="COUPLING"
          label="커플링"
          placeholder="예) AAxBB"
          tooltip="커플링명은 자주 쓰이는 이름으로 하면 좋아요"
          bind:tags={$data.tags}
          bind:query={couplingQuery}
        />

        <PublishMenuSearch
          kind="TRIGGER"
          label="트리거 주의"
          placeholder="예) 스포일러, 폭력성 등"
          tooltip="이 포스트를 독자들이 볼 때 주의해야 할 사항을 입력해주세요"
          bind:tags={$data.tags}
          bind:query={triggerQuery}
        />

        <PublishMenuSearch
          kind="EXTRA"
          label="추가 태그"
          placeholder="추가 태그"
          tooltip="위 분류에 속하지 않지만 추가적으로 넣고 싶은 태그를 입력해주세요"
          bind:tags={$data.tags}
          bind:query={extraQuery}
        />
      </div>

      <div class={css(tabIndex !== 2 && { display: 'none' })}>
        <p
          class={flex({
            gap: '4px',
            paddingTop: '4px',
            paddingBottom: '8px',
            fontSize: { base: '15px', sm: '14px' },
            fontWeight: { base: 'medium', sm: 'semibold' },
          })}
        >
          썸네일
        </p>

        {#if currentThumbnail}
          <div
            class={flex({
              justify: 'space-between',
              align: 'center',
              borderWidth: '1px',
              borderColor: 'gray.200',
              borderRadius: '4px',
              paddingX: '16px',
              paddingY: '14px',
            })}
          >
            <Image
              style={css.raw({ borderRadius: '2px', size: '60px', backgroundColor: 'gray.300' })}
              $image={currentThumbnail}
            />

            <div class={flex({ align: 'center', gap: '6px' })}>
              <button type="button" on:click={() => (thumbnail = null)}>
                <Icon icon={IconTrash} size={24} />
              </button>

              <button
                class={css({
                  borderWidth: '1px',
                  borderColor: 'gray.200',
                  borderRadius: '2px',
                  paddingX: '12px',
                  paddingY: '4px',
                  width: '54px',
                  textAlign: 'center',
                  fontSize: '11px',
                  fontWeight: 'semibold',
                  color: 'gray.400',
                })}
                type="button"
                on:click={() => thumbnailPicker.show()}
              >
                변경
              </button>
            </div>
          </div>
        {:else}
          <button
            class={flex({
              justify: 'space-between',
              align: 'center',
              borderWidth: '1px',
              borderColor: 'gray.200',
              borderRadius: '4px',
              padding: '12px',
              width: 'full',
            })}
            type="button"
            on:click={() => thumbnailPicker.show()}
          >
            <div class={flex({ align: 'center', gap: '6px' })}>
              <Icon style={css.raw({ color: 'gray.300' })} icon={IconPhoto} size={20} />
              <span class={css({ fontSize: '13px', fontWeight: 'medium', color: 'gray.400' })}>
                썸네일 이미지를 선택해주세요
              </span>
            </div>

            <div
              class={css({
                borderRadius: '4px',
                paddingX: '14px',
                paddingY: '6px',
                fontSize: '11px',
                fontWeight: 'semibold',
                color: 'gray.5',
                backgroundColor: 'teal.500',
              })}
            >
              업로드
            </div>
          </button>
        {/if}
      </div>

      <div
        class={css({ display: 'flex', flexDirection: 'column', gap: '32px' }, tabIndex !== 3 && { display: 'none' })}
      >
        <div>
          <p
            class={flex({
              gap: '4px',
              paddingTop: '4px',
              paddingBottom: '8px',
              fontSize: { base: '15px', sm: '14px' },
              fontWeight: { base: 'medium', sm: 'semibold' },
            })}
          >
            공개 범위
          </p>

          <RadioGroup
            name="visibility"
            items={[
              {
                label: '전체 공개',
                value: 'PUBLIC',
                icon: IconGlobe,
                checked: $data.visibility === 'PUBLIC',
              },
              { label: '링크 공개', value: 'UNLISTED', icon: IconLink, checked: $data.visibility === 'UNLISTED' },
              { label: '멤버 공개', value: 'SPACE', icon: IconUsers, checked: $data.visibility === 'SPACE' },
            ]}
          />
        </div>

        <div>
          <p
            class={flex({
              gap: '4px',
              paddingTop: '4px',
              paddingBottom: '8px',
              fontSize: { base: '15px', sm: '14px' },
              fontWeight: { base: 'medium', sm: 'semibold' },
            })}
          >
            <span>비밀글</span>
            <Tooltip style={center.raw()} message="설정하면 비밀번호를 입력한 독자만 내용을 열람할 수 있어요">
              <Icon style={css.raw({ color: 'gray.400' })} icon={IconAlertCircle} />
            </Tooltip>
          </p>

          <Checkbox
            style={css.raw({ marginTop: '6px', marginBottom: '12px', fontSize: '14px' })}
            checked={enablePassword}
            on:change={() => {
              enablePassword = !enablePassword;
              if (!enablePassword) {
                $data.password = null;
              }
            }}
          >
            암호설정
          </Checkbox>

          <input
            name="password"
            class={css(
              {
                borderWidth: '1px',
                borderColor: 'gray.200',
                borderRadius: '4px',
                paddingX: '16px',
                paddingY: '14px',
                width: '286px',
                height: '40px',
                fontSize: '14px',
                backgroundColor: 'gray.50',
              },
              !enablePassword && { display: 'none' },
            )}
            pattern="^[!-~]+$"
            placeholder="암호를 입력해주세요"
            type="text"
          />

          <FormValidationMessage for="password" let:message>
            <div class={flex({ align: 'center', gap: '6px', fontSize: '12px', color: 'red.600' })}>
              <Icon icon={IconAlertTriangle} />
              {message}
            </div>
          </FormValidationMessage>
        </div>

        <div>
          <p
            class={flex({
              gap: '4px',
              paddingTop: '4px',
              paddingBottom: '8px',
              fontSize: { base: '15px', sm: '14px' },
              fontWeight: { base: 'medium', sm: 'semibold' },
            })}
          >
            <span>연령 제한</span>
            <Tooltip
              style={center.raw()}
              message="연령 제한을 설정하면 본인인증이 완료된 해당 나이 이상의 독자만 내용을 열람할 수 있어요"
            >
              <Icon style={css.raw({ color: 'gray.400' })} icon={IconAlertCircle} />
            </Tooltip>
          </p>

          <RadioGroup
            name="ageRating"
            items={[
              { label: '모든 연령', value: 'ALL', text: 'ALL', checked: $data.ageRating === 'ALL' },
              { label: '15세 이상', value: 'R15', text: '15+', checked: $data.ageRating === 'R15' },
              { label: '성인물', value: 'R19', text: '20+', checked: $data.ageRating === 'R19' },
            ]}
          />
        </div>

        <div>
          <p
            class={flex({
              gap: '4px',
              paddingTop: '4px',
              paddingBottom: '8px',
              fontSize: { base: '15px', sm: '14px' },
              fontWeight: { base: 'medium', sm: 'semibold' },
            })}
          >
            <span>검색 공개</span>
            <Tooltip style={center.raw()} message="외부 검색엔진에서 이 포스트를 검색할 수 있을지 설정해요">
              <Icon style={css.raw({ color: 'gray.400' })} icon={IconAlertCircle} />
            </Tooltip>
          </p>

          <SegmentButtonGroup>
            <ToggleButton
              checked={$data.externalSearchable}
              on:change={(event) => {
                $data.externalSearchable = event.currentTarget.checked;
              }}
            >
              외부 검색 허용
            </ToggleButton>
            <ToggleButton
              checked={!$data.externalSearchable}
              on:change={(event) => {
                $data.externalSearchable = !event.currentTarget.checked;
              }}
            >
              외부 검색 비허용
            </ToggleButton>
          </SegmentButtonGroup>
        </div>
      </div>

      <div
        class={css({ display: 'flex', flexDirection: 'column', gap: '32px' }, tabIndex !== 4 && { display: 'none' })}
      >
        <Switch
          style={flex.raw({ justify: 'space-between', align: 'center' })}
          checked={$data.commentQualification !== 'NONE' ?? true}
          on:change={(e) => {
            $data.commentQualification = e.currentTarget.checked ? 'ANY' : 'NONE';
          }}
        >
          <div>
            <p
              class={flex({
                gap: '4px',
                paddingTop: '4px',
                paddingBottom: '8px',
                fontSize: { base: '15px', sm: '14px' },
                fontWeight: { base: 'medium', sm: 'semibold' },
              })}
            >
              댓글 허용
            </p>
            <p class={css({ fontSize: '11px', color: { base: 'gray.400', sm: 'gray.600' } })}>
              독자들이 게시물에 대한 의견을 나누고 소통할 수 있어요
            </p>
          </div>
        </Switch>

        <div>
          <p
            class={flex({
              gap: '4px',
              paddingY: '4px',
              fontSize: { base: '15px', sm: '14px' },
              fontWeight: { base: 'medium', sm: 'semibold' },
            })}
          >
            댓글을 달 수 있는 계정
          </p>
          <p class={css({ marginBottom: '6px', fontSize: '11px', color: 'gray.400' })}>
            게시물에 대한 댓글을 달 수 있는 계정을 선택할 수 있어요
          </p>

          <SegmentButtonGroup>
            <ToggleButton
              name="commentQualification"
              checked={$data.commentQualification === 'ANY'}
              disabled={$data.commentQualification === 'NONE'}
              type="radio"
              value="ANY"
            >
              모든계정
            </ToggleButton>
            <ToggleButton
              name="commentQualification"
              checked={$data.commentQualification === 'IDENTIFIED'}
              disabled={$data.commentQualification === 'NONE' || $query.me.personalIdentity === null}
              type="radio"
              value="IDENTIFIED"
            >
              본인 인증된 계정
            </ToggleButton>
          </SegmentButtonGroup>
        </div>
      </div>

      <div
        class={css({ display: 'flex', flexDirection: 'column', gap: '32px' }, tabIndex !== 5 && { display: 'none' })}
      >
        <Switch
          name="receiveFeedback"
          style={flex.raw({ justify: 'space-between', align: 'center' })}
          checked={$data.receiveFeedback ?? true}
        >
          <div>
            <p
              class={flex({
                gap: '4px',
                paddingY: '4px',
                fontSize: { base: '15px', sm: '14px' },
                fontWeight: { base: 'medium', sm: 'semibold' },
              })}
            >
              피드백
            </p>
            <p class={css({ fontSize: '11px', color: { base: 'gray.400', sm: 'gray.600' } })}>
              가장 오래 머무른 구간, 밑줄, 이모지 등 피드백을 받아요
            </p>
          </div>
        </Switch>

        <Switch
          name="discloseStats"
          style={flex.raw({ justify: 'space-between', align: 'center' })}
          checked={$data.discloseStats ?? true}
        >
          <div>
            <p
              class={flex({
                gap: '4px',
                paddingY: '4px',
                fontSize: { base: '15px', sm: '14px' },
                fontWeight: { base: 'medium', sm: 'semibold' },
              })}
            >
              게시물 세부 공개
            </p>
            <p class={css({ fontSize: '11px', color: { base: 'gray.400', sm: 'gray.600' } })}>
              독자에게 좋아요, 조회수를 공유해요
            </p>
          </div>
        </Switch>

        <Switch
          name="receivePatronage"
          style={flex.raw({ justify: 'space-between', align: 'center' })}
          checked={$data.receivePatronage ?? true}
        >
          <div>
            <p
              class={flex({
                gap: '4px',
                paddingY: '4px',
                fontSize: { base: '15px', sm: '14px' },
                fontWeight: { base: 'medium', sm: 'semibold' },
              })}
            >
              창작자 후원
            </p>
            <p class={css({ fontSize: '11px', color: { base: 'gray.400', sm: 'gray.600' } })}>
              독자들이 게시물에 자유롭게 후원할 수 있어요
            </p>
          </div>
        </Switch>

        <Switch
          name="protectContent"
          style={flex.raw({ justify: 'space-between', align: 'center' })}
          checked={$data.protectContent ?? true}
        >
          <div>
            <p
              class={flex({
                gap: '4px',
                paddingY: '4px',
                fontSize: { base: '15px', sm: '14px' },
                fontWeight: { base: 'medium', sm: 'semibold' },
              })}
            >
              게시물 내용 보호
            </p>
            <p class={css({ fontSize: '11px', color: { base: 'gray.400', sm: 'gray.600' } })}>
              게시물의 내용을 보호하기 위해 우클릭 또는 복사를 제한해요
            </p>
          </div>
        </Switch>
      </div>
    </form>
  </div>

  <div
    class={flex({
      justify: 'flex-end',
      paddingX: '24px',
      paddingY: '20px',
      sm: { borderTopWidth: '1px', borderTopColor: 'gray.200' },
    })}
  >
    <Tooltip
      style={css.raw({ smDown: { flex: '1' } })}
      enabled={!selectedSpaceId}
      message="게시할 스페이스를 선택해주세요"
      offset={12}
      placement="top"
    >
      <Button
        style={css.raw({
          paddingX: '32px',
          width: { base: 'full', sm: '96px' },
        })}
        disabled={!selectedSpaceId}
        loading={$isSubmitting}
        size="lg"
        type="button"
        on:click={handleSubmit}
      >
        발행
      </Button>
    </Tooltip>
  </div>
</div>

{#if $query}
  <CreateSpaceModal
    $user={$query.me}
    via="editor"
    bind:open={createSpaceOpen}
    on:create={(event) => {
      selectedSpaceId = event.detail.id;
      selectedCollectionId = undefined;
      spaceSelectorOpen = false;
    }}
  />
{/if}

{#if selectedSpaceId}
  <CreateCollectionModal bind:open={createCollectionOpen} bind:spaceId={selectedSpaceId} />
{/if}

<ThumbnailPicker bind:this={thumbnailPicker} keepBoundsWhenClosed on:change={(e) => (thumbnail = e.detail)} />
