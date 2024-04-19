<script lang="ts">
  import { graphql } from '$glitch';
  import { Helmet } from '$lib/components';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import Post from '../Post.svelte';

  $: query = graphql(`
    query FeedPage_Query {
      followingFeed {
        id
        ...Feed_Post_post
      }

      ...Feed_Post_query
    }
  `);
</script>

<Helmet description="관심있는 스페이스와 태그의 최신 포스트들을 둘러보세요" title="관심 스페이스 & 태그 피드" />

<div
  class={css({
    display: 'flex',
    flexDirection: 'column',
    flexGrow: '1',
    marginX: 'auto',
    paddingX: '20px',
    width: 'full',
    maxWidth: '860px',
  })}
>
  <h1 class={css({ marginBottom: '14px', fontWeight: 'semibold' })}>구독 스페이스 & 태그</h1>

  <ul class={flex({ direction: 'column', flexGrow: '1' })}>
    {#each $query.followingFeed as post (post.id)}
      <li
        class={css({
          _after: { content: '""', display: 'block', height: '1px', backgroundColor: 'gray.100' },
          _lastOfType: { _after: { display: 'none' } },
        })}
      >
        <Post $post={post} {$query} showBookmark showDate showSpace />
      </li>
    {:else}
      <li class={css({ marginY: 'auto', fontWeight: 'semibold', color: 'gray.400', textAlign: 'center' })}>
        구독한 스페이스 및 태그가 없어요
      </li>
    {/each}
  </ul>
</div>
