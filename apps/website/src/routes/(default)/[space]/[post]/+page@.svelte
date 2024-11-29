<script lang="ts">
  import dayjs from 'dayjs';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { graphql } from '$glitch';
  import { analytics } from '$lib/analytics';
  import { Helmet } from '$lib/components';
  import { css } from '$styled-system/css';
  import Footer from '../../Footer.svelte';
  import Header from '../../Header.svelte';
  import PostView from '../PostView.svelte';

  $: query = graphql(`
    query SpacePostPage_Query($permalink: String!) {
      me {
        id
      }

      post(permalink: $permalink) {
        id
        externalSearchable
        visibility
        publishedAt

        member @_required {
          id

          profile {
            id
            name
          }
        }

        space @_required {
          id
          slug
          name
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

      ...DefaultLayout_Header_query
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
  let headerEl: HTMLElement;
  let prevScrollpos = 0;

  $: if (browser && postId !== $query.post.id) {
    postId = $query.post.id;
    analytics.track('post:view', { postId });
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
  image={{ src: `${$page.url.origin}/api/opengraph/post/${$query.post.id}`, size: 'large' }}
  struct={{
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': $query.post.publishedRevision.title ?? '(제목 없음)',
    'description': `${$query.post.publishedRevision.subtitle ? `${$query.post.publishedRevision.subtitle} | ` : ''}${$query.post.publishedRevision.previewText}`,
    'datePublished': dayjs($query.post.publishedAt).toISOString(),
    'dateModified': dayjs($query.post.publishedRevision.createdAt).toISOString(),
    'image': [`${$page.url.origin}/api/opengraph/post/${$query.post.id}`],
    'author': [
      {
        '@type': 'Organization',
        'name': $query.post.space.name,
        'url': `${$page.url.origin}/${$query.post.space.slug}`,
      },
      {
        '@type': 'Person',
        'name': $query.post.member.profile.name,
        'url': `${$page.url.origin}/${$query.post.space.slug}/about`,
      },
    ],
  }}
  title={$query.post.publishedRevision.title ?? '(제목 없음)'}
  type="article"
/>

<svelte:head>
  {#if !$query.post.externalSearchable || $query.post.visibility !== 'PUBLIC'}
    <meta name="robots" content="noindex" />
  {/if}
  <meta content={dayjs($query.post.publishedAt).toISOString()} property="article:published_time" />
  <meta content={dayjs($query.post.publishedRevision.createdAt).toISOString()} property="article:modified_time" />
  <meta content={$query.post.space.name} property="article:author" />
  <meta content={$query.post.member.profile.name} property="article:author" />
  {#each $query.post.tags as { tag } (tag.id)}
    <meta content={tag.name} property="article:tag" />
  {/each}
</svelte:head>

<svelte:window
  on:scroll={(e) => {
    if (e.currentTarget.innerWidth < 992) {
      var currentScrollPos = e.currentTarget.scrollY;

      headerEl.style.top = prevScrollpos > currentScrollPos ? '0' : '-62px';
      prevScrollpos = currentScrollPos;
    }
  }}
/>

<Header style={css.raw({ transition: 'all' })} {$query} bind:headerEl />

<PostView $postRevision={$query.post.publishedRevision} {$query} />

<Footer />
