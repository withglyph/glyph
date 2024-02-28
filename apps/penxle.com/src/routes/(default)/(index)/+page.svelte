<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { graphql } from '$glitch';
  import { css } from '$styled-system/css';
  import PostCard from './PostCard.svelte';

  $: query = graphql(`
    query IndexPage_Query {
      recommendFeed {
        id
        ...Feed_PostCard_post
      }
    }
  `);
</script>

<svelte:head>
  <meta name="naver-site-verification" content="b127529850b2cea3fde71eaf9c43d5b6cbb76d42" />
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "펜슬",
      "url": "https://pencil.so"
    }
  </script>
</svelte:head>

<Helmet
  description="펜슬은 누구나 창작자가 될 수 있는, 개인 창작자들을 위한 자유롭고 즐거운 창작 사이트예요. 펜슬에 1, 2차 창작물을 올리고, 다른 사람들의 창작 활동을 둘러보세요."
  image={{
    src: 'https://pnxl.net/assets/opengraph/default-cover.png',
    size: 'large',
  }}
  title="누구나 창작자가 되다, 펜슬"
  titleSuffix=""
/>

<div class={css({ paddingTop: '32px', paddingBottom: '2px', fontSize: '24px', fontWeight: 'bold' })}>추천 포스트</div>
<div class={css({ fontSize: '14px', fontWeight: 'medium', color: 'gray.500' })}>
  펜슬에 올라오는 포스트들을 둘러보세요
</div>

<div class={css({ display: 'flex', flexDirection: 'column', gap: '32px', marginTop: '32px', width: 'full' })}>
  {#each $query.recommendFeed as post (post.id)}
    <div class={css({ flexGrow: '1', borderBottomWidth: '1px', borderBottomColor: 'gray.200', width: 'full' })} />
    <PostCard $post={post} />
  {/each}
</div>
