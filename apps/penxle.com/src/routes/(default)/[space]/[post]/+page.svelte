<script lang="ts">
  import dayjs from 'dayjs';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Helmet } from '$lib/components';
  import PostView from '../PostView.svelte';

  $: query = graphql(`
    query SpacePostPage_Query($permalink: String!) {
      me {
        id
      }

      post(permalink: $permalink) {
        id
        externalSearchable
        publishedAt

        space {
          id
          slug
        }

        member {
          id

          profile {
            id
            name
          }
        }

        publishedRevision @_required {
          id
          title
          subtitle
          previewText
          createdAt
          ...Post_postRevision
        }

        tags {
          id

          tag {
            id
            name
          }
        }
      }

      ...Post_query
    }
  `);

  const updatePostView = graphql(`
    mutation SpacePostPage_UpdatePostView_Mutation($input: UpdatePostViewInput!) {
      updatePostView(input: $input) {
        id
        viewCount
      }
    }
  `);

  let postId: string | undefined;

  $: if (browser && postId !== $query.post.id) {
    postId = $query.post.id;
    mixpanel.track('post:view', { postId });
    updatePostView({ postId });
  }

  // $: if ($query.post.space?.slug && $query.post.space?.slug !== $page.params.space && browser) {
  //   const url = new URL(location.href);
  //   url.pathname = `/${$query.post.space.slug}/${$page.params.post}`;
  //   goto(url, { replaceState: true });
  // }
</script>

<Helmet
  description={`${$query.post.publishedRevision.subtitle ? `${$query.post.publishedRevision.subtitle} | ` : ''}${$query.post.publishedRevision.previewText}`}
  image={{
    src: `${$page.url.origin}/api/opengraph/post/${$query.post.id}`,
    size: 'large',
  }}
  title={$query.post.publishedRevision.title ?? '(제목 없음)'}
  type="article"
/>

<svelte:head>
  {#if !$query.post.externalSearchable}
    <meta name="robots" content="noindex" />
  {/if}
  <meta content={dayjs($query.post.publishedAt).toISOString()} property="article:published_time" />
  <meta content={dayjs($query.post.publishedRevision.createdAt).toISOString()} property="article:modified_time" />
  <meta content={$query.post.member?.profile.name} property="article:author" />
  {#each $query.post.tags as { tag } (tag.id)}
    <meta content={tag.name} property="article:tag" />
  {/each}
</svelte:head>

<PostView $postRevision={$query.post.publishedRevision} {$query} />
