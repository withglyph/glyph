<script lang="ts">
  import Sortable from 'sortablejs';
  import { onDestroy, onMount } from 'svelte';
  import IconGripVertical from '~icons/tabler/grip-vertical';
  import IconMinus from '~icons/tabler/minus';
  import IconPlus from '~icons/tabler/plus';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Button, Helmet, Icon, Image } from '$lib/components';
  import { isWebView } from '$lib/flutter';
  import { toast } from '$lib/notification';
  import { isMobile } from '$lib/utils';
  import { css, cx } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';
  import ManageSpacePostsModal from './ManageSpacePostsModal.svelte';

  let sortable: Sortable;
  let sortableContainer: HTMLUListElement;

  let registeredPosts: (typeof $query.spaceCollection.posts)[number][] = [];
  let open = false;

  $: query = graphql(`
    query SpaceDashboardCollectionsEntityPostsPage_Query($slug: String!) {
      spaceCollection(slug: $slug) {
        id
        name

        space {
          id
          slug
          name

          posts {
            id
          }
        }

        posts(order: OLDEST) {
          id

          thumbnail {
            id
            ...Image_image
          }

          publishedRevision {
            id
            title
            subtitle
          }
        }
      }
    }
  `);

  const setSpaceCollectionPosts = graphql(`
    mutation SpaceDashboardCollectionsEntityPostsPage_SetSpaceCollectionPosts_Mutation(
      $input: SetSpaceCollectionPostsInput!
    ) {
      setSpaceCollectionPosts(input: $input) {
        id

        posts {
          id
        }
      }
    }
  `);

  const reorderArray = (arr: (typeof $query.spaceCollection.posts)[number][], newIndex: number, oldIndex: number) => {
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

  const removePost = (postId: string) => {
    registeredPosts = registeredPosts.filter((p: (typeof $query.spaceCollection.posts)[number]) => p.id !== postId);
  };

  onMount(() => {
    let sortableOptions: Sortable.Options = {
      scroll: true,
      handle: '.post',
      animation: 150,
      delay: isMobile() || $isWebView ? 50 : 0,
      forceAutoScrollFallback: true,
      scrollSensitivity: 60,
      scrollSpeed: 10,
      bubbleScroll: true,
      onEnd: ({ newIndex, oldIndex }) => {
        if (newIndex === undefined || oldIndex === undefined) return;

        registeredPosts = reorderArray(registeredPosts, newIndex, oldIndex);
      },
    };

    if (sortableContainer) {
      sortable = Sortable.create(sortableContainer, sortableOptions);
    }

    registeredPosts = $query.spaceCollection.posts;
  });

  onDestroy(() => {
    if (sortable) {
      sortable.destroy();
    }
  });

  $: if (!open) {
    registeredPosts = $query.spaceCollection.posts;
  }
</script>

<Helmet
  description={`${$query.spaceCollection.space.name} 스페이스의 ${$query.spaceCollection.name} 컬렉션 포스트 관리`}
  title={`${$query.spaceCollection.space.name}의 ${$query.spaceCollection.name}`}
/>

<div
  class={flex({
    align: { sm: 'center' },
    justify: 'space-between',
    position: 'sticky',
    top: { base: $isWebView ? '99px' : '163px', sm: '186px' },
    zIndex: '1',
    smDown: { flexDirection: 'column', gap: '12px', padding: '20px', backgroundColor: 'gray.50' },
    sm: {
      paddingTop: '32px',
      paddingBottom: '14px',
      backgroundColor: 'gray.0',
    },
  })}
>
  <div>
    <h2 class={css({ marginBottom: '2px', fontSize: '17px', fontWeight: 'semibold' })}>포스트 관리</h2>
    <p class={css({ fontSize: '13px', color: 'gray.500' })}>박스를 드래그해서 놓으면 순서를 변경할 수 있어요</p>
  </div>

  <Button
    style={flex.raw({ align: 'center', gap: '4px', marginLeft: 'auto', backgroundColor: 'gray.0' })}
    variant="gray-outline"
    on:click={() => (open = true)}
  >
    <Icon icon={IconPlus} />
    포스트 추가
  </Button>
</div>

<ul bind:this={sortableContainer} class={flex({ direction: 'column', gap: '8px', grow: '1' })}>
  {#each registeredPosts as post, index (post.id)}
    <li
      class={cx(
        'post',
        flex({
          align: 'center',
          borderColor: 'gray.100',
          paddingY: '20px',
          paddingX: '14px',
          backgroundColor: 'gray.0',
          smDown: { '& + &': { borderTopWidth: '1px' } },
          sm: { borderWidth: '1px' },
        }),
      )}
    >
      <span
        class={css({
          marginRight: '4px',
          fontSize: '12px',
          color: 'gray.500',
          fontWeight: 'medium',
          textAlign: 'center',
          minWidth: '36px',
        })}
      >
        {index + 1}화
      </span>
      <Image
        style={css.raw({
          flex: 'none',
          marginRight: '8px',
          width: '80px',
          aspectRatio: '16/10',
          objectFit: 'cover',
        })}
        $image={post.thumbnail}
        placeholder
        size={96}
      />

      <div class={css({ flexGrow: '1', truncate: true })}>
        <p class={css({ fontSize: '14px', fontWeight: 'medium', truncate: true })}>
          {post.publishedRevision?.title ?? '(제목 없음)'}
        </p>
        <p class={css({ fontSize: '13px', color: 'gray.600', truncate: true })}>
          {post.publishedRevision?.subtitle ?? ''}
        </p>
      </div>

      <button
        class={center({ flex: 'none', marginLeft: '20px', marginRight: '12px', size: '28px' })}
        type="button"
        on:click={() => removePost(post.id)}
      >
        <Icon style={css.raw({ color: 'red.600' })} icon={IconMinus} size={20} />
      </button>

      <button class={center({ flex: 'none', size: '28px' })} type="button">
        <Icon icon={IconGripVertical} size={20} />
      </button>
    </li>
  {:else}
    <li class={css({ paddingY: '77px' })}>
      <p class={css({ fontSize: '15px', color: 'gray.500', textAlign: 'center' })}>컬렉션에 추가된 포스트가 없어요</p>
    </li>
  {/each}
</ul>

<div
  class={css({
    position: 'sticky',
    bottom: '0',
    marginTop: '20px',
    paddingX: { smDown: '20px' },
    paddingY: '20px',
    width: 'full',
    backgroundColor: 'gray.0',
  })}
>
  <Button
    style={css.raw({ width: 'full' })}
    variant="gradation-fill"
    on:click={async () => {
      await setSpaceCollectionPosts({
        spaceCollectionId: $query.spaceCollection.id,
        postIds: registeredPosts.map((post) => post.id),
      });
      mixpanel.track('space:collection:update', {
        spaceId: $query.spaceCollection.space.id,
        collectionId: $query.spaceCollection.id,
        postIds: [registeredPosts.map((post) => post.id)],
      });
      toast.success('컬렉션의 포스트 순서가 변경되었어요');
    }}
  >
    저장
  </Button>
</div>

<ManageSpacePostsModal
  collectionId={$query.spaceCollection.id}
  spaceSlug={$query.spaceCollection.space.slug}
  bind:open
/>
