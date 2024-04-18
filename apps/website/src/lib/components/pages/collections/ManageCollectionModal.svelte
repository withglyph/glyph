<script lang="ts">
  import mixpanel from 'mixpanel-browser';
  import Sortable from 'sortablejs';
  import { onDestroy } from 'svelte';
  import IconHelpLine from '~icons/glyph/help-line';
  import IconSearch from '~icons/glyph/search';
  import IconAdjustmentsHorizontal from '~icons/tabler/adjustments-horizontal';
  import IconChevronLeft from '~icons/tabler/chevron-left';
  import IconGripVertical from '~icons/tabler/grip-vertical';
  import IconLayoutGrid from '~icons/tabler/layout-grid';
  import IconMinus from '~icons/tabler/minus';
  import IconPlus from '~icons/tabler/plus';
  import { fragment, graphql } from '$glitch';
  import { Icon, Tooltip } from '$lib/components';
  import Image from '$lib/components/Image.svelte';
  import { Button, Modal } from '$lib/components/v2';
  import { TextInput } from '$lib/components/v2/forms';
  import { createMutationForm } from '$lib/form';
  import { SetSpaceCollectionPostSchema } from '$lib/validations';
  import { css, cx } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';
  import type {
    SpaceCollectionsEntityPage_ManageCollectionModal_collection,
    SpaceCollectionsEntityPage_ManageCollectionModal_post,
  } from '$glitch';

  let _collection: SpaceCollectionsEntityPage_ManageCollectionModal_collection;
  let _posts: SpaceCollectionsEntityPage_ManageCollectionModal_post[];
  export { _collection as $collection, _posts as $posts };
  export let open = false;
  export let spaceId: string;

  let query = '';

  $: posts = fragment(
    _posts,
    graphql(`
      fragment SpaceCollectionsEntityPage_ManageCollectionModal_post on Post {
        id
        permalink
        publishedAt

        collection {
          id
        }

        thumbnail {
          id
          ...Image_image
        }

        publishedRevision @_required {
          id
          title
          subtitle
        }
      }
    `),
  );

  $: collection = fragment(
    _collection,
    graphql(`
      fragment SpaceCollectionsEntityPage_ManageCollectionModal_collection on SpaceCollection {
        id
        name

        thumbnail {
          id
          ...Image_image
        }

        posts {
          id

          publishedRevision @_required {
            id
            title
          }

          thumbnail {
            id
            ...Image_image
          }
        }
      }
    `),
  );

  let registeredPosts: typeof $collection.posts = [];
  const initializeRegisteredPosts = () => {
    registeredPosts = $collection.posts;
  };

  $: if (open) {
    initializeRegisteredPosts();
  }

  const { form, setInitialValues, isSubmitting, handleSubmit } = createMutationForm({
    mutation: graphql(`
      mutation SpaceCollectionsEntityPage_ManageCollectionModal_SetSpaceCollectionPosts_Mutation(
        $input: SetSpaceCollectionPostsInput!
      ) {
        setSpaceCollectionPosts(input: $input) {
          id
        }
      }
    `),
    extra: async () => ({ postIds: registeredPosts.map((post) => post.id) }),
    schema: SetSpaceCollectionPostSchema,
    onSuccess: () => {
      open = false;
      mixpanel.track('space:collection:update', {
        spaceId,
        collectionId: $collection.id,
        postIds: [registeredPosts.map((post) => post.id)],
      });
    },
  });

  $: setInitialValues({ spaceCollectionId: $collection.id, postIds: [] });

  const registerPost = (post: (typeof $collection.posts)[number]) => {
    registeredPosts = [...registeredPosts, post];
  };

  const removePost = (post: (typeof $collection.posts)[number]) => {
    registeredPosts = registeredPosts.filter((p: (typeof $collection.posts)[number]) => p.id !== post.id);
  };

  $: filteredPosts = $posts.filter((post) => {
    const searchResult =
      post.publishedRevision?.title?.includes(query) || (query === '' && !post.publishedRevision?.title);
    const isInOtherCollection = !!post.collection && post.collection.id !== $collection.id;

    return searchResult && !isInOtherCollection;
  });

  let page: 'registerPosts' | 'reorderPosts' = 'registerPosts';

  let sortable: Sortable;
  let sortableContainer: HTMLUListElement;

  const reorderArray = (arr: (typeof $collection.posts)[number][], newIndex: number, oldIndex: number) => {
    const draggedItem = arr[oldIndex];

    if (oldIndex > newIndex) {
      arr = [...arr.slice(0, newIndex), draggedItem, ...arr.slice(newIndex, oldIndex), ...arr.slice(oldIndex + 1)];
    } else {
      arr = [
        ...arr.slice(0, oldIndex),
        ...arr.slice(oldIndex + 1, newIndex + 1),
        draggedItem,
        ...arr.slice(newIndex + 1),
      ];
    }

    return arr;
  };

  let sortableOptions: Sortable.Options = {
    scroll: true,
    handle: '.post',
    animation: 150,
    delay: 50,
    forceAutoScrollFallback: true,
    scrollSensitivity: 60,
    scrollSpeed: 10,
    bubbleScroll: true,
    onEnd: ({ newIndex, oldIndex }) => {
      if (newIndex === undefined || oldIndex === undefined) return;

      registeredPosts = reorderArray(registeredPosts, newIndex, oldIndex);
    },
  };

  $: if (sortableContainer) {
    sortable = Sortable.create(sortableContainer, sortableOptions);
  }

  onDestroy(() => {
    if (sortable) {
      sortable.destroy();
    }
  });
</script>

<Modal style={flex.raw({ direction: 'column', minHeight: { base: '482px', sm: '540px' } })} bind:open>
  <svelte:fragment slot="title-left">
    {#if page === 'reorderPosts'}
      <button type="button" on:click={() => (page = 'registerPosts')}>
        <Icon icon={IconChevronLeft} size={24} />
      </button>
    {/if}
  </svelte:fragment>

  <svelte:fragment slot="title">
    <p class={flex({ align: 'center', gap: '4px' })}>
      {page === 'registerPosts' ? '컬렉션 관리' : '순서 변경'}<Tooltip
        message={page === 'registerPosts'
          ? '한 포스트는 하나의 컬렉션에만 포함될 수 있어요'
          : '박스를 드래그해서 놓으면 순서를 변경할 수 있어요'}
      >
        <Icon style={css.raw({ 'color': 'gray.300', '& *': { strokeWidth: '[1]' } })} icon={IconHelpLine} />
      </Tooltip>
    </p>
  </svelte:fragment>

  {#if page === 'registerPosts'}
    <TextInput
      style={css.raw({ marginBottom: '8px' })}
      placeholder="포스트를 검색해주세요"
      on:input={(e) => (query = e.currentTarget.value.trim())}
    >
      <Icon slot="left-icon" icon={IconSearch} />
    </TextInput>

    <Button
      style={flex.raw({
        align: 'center',
        gap: '4px',
        marginLeft: 'auto',
        marginBottom: '14px',
        paddingY: '8px',
      })}
      size="sm"
      variant="gray-outline"
      on:click={() => (page = 'reorderPosts')}
    >
      <Icon icon={IconLayoutGrid} />
      순서변경
    </Button>
  {:else}
    <Button
      style={flex.raw({
        align: 'center',
        gap: '4px',
        marginLeft: 'auto',
        marginBottom: '16px',
        paddingY: '8px',
      })}
      size="sm"
      variant="gray-outline"
      on:click={() => (page = 'registerPosts')}
    >
      <Icon icon={IconAdjustmentsHorizontal} />
      컬렉션관리
    </Button>
  {/if}

  <form class={css(filteredPosts.length === 0 && { marginY: 'auto' })} use:form>
    {#if page === 'registerPosts'}
      <ul>
        {#each filteredPosts as post (post.id)}
          <li
            class={flex({
              gap: '16px',
              borderTopWidth: '1px',
              borderTopColor: 'gray.100',
              paddingY: '20px',
              _firstOfType: { paddingTop: '8px', borderStyle: 'none' },
            })}
          >
            <Image
              style={css.raw({ flex: 'none', height: '60px', aspectRatio: '16/10', objectFit: 'cover' })}
              $image={post.thumbnail}
              placeholder
              size={96}
            />

            <div class={flex({ direction: 'column', gap: '14px', flexGrow: '1', truncate: true })}>
              <div class={css({ truncate: true })}>
                <p class={css({ fontSize: '14px', fontWeight: 'medium', truncate: true })}>
                  {post.publishedRevision?.title ?? '(제목 없음)'}
                </p>
                <p class={css({ marginTop: '2px', fontSize: '13px', color: 'gray.600', height: '19px' })}>
                  {post.publishedRevision?.subtitle ?? ''}
                </p>
              </div>
              {#if registeredPosts.some((p) => p.id === post.id)}
                <Button
                  style={flex.raw({ align: 'center', gap: '4px', flex: 'none', marginLeft: 'auto', width: 'fit' })}
                  size="sm"
                  variant="gray-sub-fill"
                  on:click={() => removePost(post)}
                >
                  <Icon icon={IconMinus} />
                  컬렉션 제외
                </Button>
              {:else}
                <Button
                  style={flex.raw({ align: 'center', gap: '4px', flex: 'none', marginLeft: 'auto', width: 'fit' })}
                  size="sm"
                  variant="cyan-fill"
                  on:click={() => registerPost(post)}
                >
                  <Icon icon={IconPlus} />
                  컬렉션 추가
                </Button>
              {/if}
            </div>
          </li>
        {:else}
          <li
            class={css({
              fontSize: '15px',
              color: 'gray.500',
              textAlign: 'center',
              wordBreak: 'keep-all',
            })}
          >
            {$posts.length === 0 ? '스페이스에 업로드 된 포스트가 없어요' : '일치하는 검색 결과가 없어요'}
          </li>
        {/each}
      </ul>
    {:else}
      <ul bind:this={sortableContainer} class={css({ display: 'flex', flexDirection: 'column', gap: '8px' })}>
        {#each registeredPosts as post, index (post.id)}
          <li
            class={cx(
              'post',
              flex({
                align: 'center',
                borderWidth: '1px',
                borderColor: 'gray.100',
                padding: '12px',
                backgroundColor: 'gray.5',
              }),
            )}
          >
            <span class={css({ fontSize: '14px', color: 'gray.400', textAlign: 'center', minWidth: '26px' })}>
              {index + 1}
            </span>
            <Image
              style={css.raw({
                flex: 'none',
                marginRight: '6px',
                height: '25px',
                aspectRatio: '16/10',
                objectFit: 'cover',
              })}
              $image={post.thumbnail}
              placeholder
              size={48}
            />

            <p class={css({ flexGrow: '1', fontSize: '14px', fontWeight: 'semibold', truncate: true })}>
              {post.publishedRevision?.title ?? '(제목 없음)'}
            </p>

            <button
              class={center({ flex: 'none', marginLeft: '20px', marginRight: '12px', size: '28px' })}
              type="button"
              on:click={() => removePost(post)}
            >
              <Icon style={css.raw({ color: 'red.600' })} icon={IconMinus} size={20} />
            </button>

            <button class={center({ flex: 'none', size: '28px' })} type="button">
              <Icon icon={IconGripVertical} size={20} />
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </form>

  <svelte:fragment slot="action">
    {#if page === 'registerPosts'}
      <Button
        style={css.raw({ width: 'full' })}
        disabled={$posts.length === 0}
        loading={$isSubmitting}
        type="submit"
        on:click={handleSubmit}
      >
        컬렉션 저장
      </Button>
    {:else}
      <Button
        style={css.raw({ width: 'full' })}
        disabled={$posts.length === 0}
        loading={$isSubmitting}
        type="submit"
        variant="gray-outline"
        on:click={handleSubmit}
      >
        순서 변경 완료
      </Button>
    {/if}
  </svelte:fragment>
</Modal>
