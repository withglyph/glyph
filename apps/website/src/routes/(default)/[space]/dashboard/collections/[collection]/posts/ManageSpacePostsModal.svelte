<script lang="ts">
  import { onMount } from 'svelte';
  import IconHelpLine from '~icons/glyph/help-line';
  import IconSearch from '~icons/tabler/search';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Icon, Tooltip } from '$lib/components';
  import { Button, Modal } from '$lib/components/v2';
  import { TextInput } from '$lib/components/v2/forms';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import SpacePost from './SpacePost.svelte';

  export let open = false;
  export let collectionId: string;
  export let spaceSlug: string;

  let selectedPostIds: string[] = [];
  let query = '';

  $: spacePostsQuery = graphql(`
    query ManageSpacePostsModal_spacePostsQuery_Query($slug: String!, $anyCollection: Boolean) @_manual {
      space(slug: $slug) {
        id

        posts(anyCollection: $anyCollection) {
          id
          ...ManageSpacePostsModal_SpacePost_post

          publishedRevision {
            id
            title
            subtitle
          }
        }
      }
    }
  `);

  $: spaceAnyCollectionPostsQuery = graphql(`
    query ManageSpacePostsModal_spaceAnyCollectionPostsQuery_Query($slug: String!, $anyCollection: Boolean) @_manual {
      space(slug: $slug) {
        id

        posts(anyCollection: $anyCollection) {
          id
          ...ManageSpacePostsModal_SpacePost_post

          publishedRevision {
            id
            title
            subtitle
          }
        }
      }
    }
  `);

  onMount(() => {
    spacePostsQuery.refetch({ slug: spaceSlug, anyCollection: false });
    spaceAnyCollectionPostsQuery.refetch({ slug: spaceSlug, anyCollection: true });
  });

  const appendSpaceCollectionPosts = graphql(`
    mutation ManageSpacePostsModal_AppendSpaceCollectionPosts_Mutation($input: AppendSpaceCollectionPostsInput!) {
      appendSpaceCollectionPosts(input: $input) {
        id
      }
    }
  `);

  $: postsNotInCollection = $spacePostsQuery?.space.posts.filter(
    (p) => p.publishedRevision?.title?.includes(query) || p.publishedRevision?.subtitle?.includes(query),
  );
  $: postsInCollection = $spaceAnyCollectionPostsQuery?.space.posts.filter(
    (p) => p.publishedRevision?.title?.includes(query) || p.publishedRevision?.subtitle?.includes(query),
  );
</script>

<Modal style={flex.raw({ direction: 'column', grow: '1', paddingTop: '0' })} size="lg" bind:open>
  <div slot="title" class={flex({ align: 'center', gap: '4px' })}>
    <p>포스트 추가</p>
    <Tooltip message="다른 컬렉션에 속하지 않은 포스트만 컬렉션에 추가할 수 있어요" offset={4} placement="top">
      <Icon style={css.raw({ 'color': 'gray.300', '& *': { strokeWidth: '[1]' } })} icon={IconHelpLine} />
    </Tooltip>
  </div>

  <div
    class={css({
      position: 'sticky',
      top: '0',
      marginX: '-20px',
      paddingX: '20px',
      paddingTop: '16px',
      paddingBottom: '27px',
      backgroundColor: 'gray.0',
      zIndex: '1',
    })}
  >
    <TextInput style={css.raw({ marginBottom: '10px' })} placeholder="포스트를 검색해주세요" bind:value={query}>
      <Icon slot="left-icon" style={css.raw({ color: 'gray.400' })} icon={IconSearch} />
    </TextInput>
  </div>

  <ul class={flex({ direction: 'column', grow: '1' })}>
    {#if postsNotInCollection && postsInCollection}
      {#each postsNotInCollection as post (post.id)}
        <SpacePost $post={post} bind:selectedPostIds />
      {/each}
      {#each postsInCollection as post (post.id)}
        <SpacePost $post={post} included bind:selectedPostIds />
      {/each}
      {#if postsNotInCollection.length === 0 && postsInCollection.length === 0}
        <li
          class={css({ marginY: 'auto', paddingY: '77px', fontSize: '15px', color: 'gray.500', textAlign: 'center' })}
        >
          포스트가 없어요
        </li>
      {/if}
    {/if}
  </ul>

  <Button
    slot="action"
    style={css.raw({ width: 'full' })}
    size="lg"
    on:click={async () => {
      if (!$spacePostsQuery) return;

      if (selectedPostIds.length > 0) {
        await appendSpaceCollectionPosts({ postIds: selectedPostIds, spaceCollectionId: collectionId });
        mixpanel.track('space:collection:post:append', {
          spaceId: $spacePostsQuery.space.id,
          spaceCollectionId: collectionId,
          postIds: selectedPostIds,
        });
      }

      open = false;
    }}
  >
    확인
  </Button>
</Modal>
