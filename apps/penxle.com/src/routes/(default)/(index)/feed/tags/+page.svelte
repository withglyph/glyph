<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { graphql } from '$glitch';
  import { css } from '$styled-system/css';
  import PostCard from '../../PostCard.svelte';

  $: query = graphql(`
    query FeedTagsPage_Query {
      tagFeed {
        id
        ...Feed_PostCard_post
      }
    }
  `);
</script>

<Helmet description="관심있는 태그의 최신 포스트들을 둘러보세요" title="관심 태그 피드" />

<div class={css({ paddingTop: '32px', paddingBottom: '2px', fontSize: '24px', fontWeight: 'bold' })}>관심 태그</div>
<div class={css({ fontSize: '14px', fontWeight: 'medium', color: 'gray.500' })}>
  관심있는 태그의 최신 포스트들을 둘러보세요
</div>

<div class={css({ display: 'flex', flexDirection: 'column', gap: '32px', marginTop: '32px', width: 'full' })}>
  {#each $query.tagFeed as post (post.id)}
    <div class={css({ flexGrow: '1', borderBottomWidth: '1px', borderBottomColor: 'gray.200', width: 'full' })} />
    <PostCard $post={post} />
  {/each}
</div>
