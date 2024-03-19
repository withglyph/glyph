<script lang="ts">
  import { graphql } from '$glitch';
  import { Helmet } from '$lib/components';
  import { css } from '$styled-system/css';
  import PostItem from '../PostItem.svelte';

  $: query = graphql(`
    query MeCabinetsIndexPage_Query {
      auth(scope: USER)

      me @_required {
        id

        emojiReactedPosts {
          id
          ...PostItem_post
        }
      }
    }
  `);
</script>

<Helmet description="이모지 반응을 남긴 포스트 목록을 둘러보세요" title="반응을 남긴 포스트" />

{#each $query.me.emojiReactedPosts as post (post.id)}
  <PostItem $post={post} />
{:else}
  <p class={css({ paddingY: '40px', fontWeight: 'medium', color: 'gray.500', textAlign: 'center' })}>
    이모지 반응을 남긴 포스트가 없어요
  </p>
{/each}
