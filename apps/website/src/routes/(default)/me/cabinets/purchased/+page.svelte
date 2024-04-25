<script lang="ts">
  import { graphql } from '$glitch';
  import { Helmet } from '$lib/components';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import PurchasedPost from './PurchasedPost.svelte';

  $: query = graphql(`
    query MeCabinetsPurchasedPage_Query {
      auth(scope: USER)

      me @_required {
        id

        purchasedPosts {
          id
          ...MeCabinetsPurchasedPage_PurchasedPost_post
        }
      }
    }
  `);
</script>

<Helmet description="구매한 포스트 목록을 둘러보세요" title="구매한 포스트" />

<p class={css({ paddingTop: '12px', paddingBottom: '10px', fontSize: '12px', color: 'gray.500' })}>
  총 {$query.me.purchasedPosts.length}개의 포스트
</p>

<ul class={flex({ direction: 'column', flexGrow: '1' })}>
  {#each $query.me.purchasedPosts as post (post.id)}
    <li
      class={css({
        borderTopWidth: '1px',
        borderTopColor: 'gray.100',
        _firstOfType: { 'borderStyle': 'none', '& > a': { paddingTop: '0' } },
      })}
    >
      <PurchasedPost $post={post} />
    </li>
  {:else}
    <li class={css({ marginY: 'auto', paddingY: '60px', fontSize: '14px', color: 'gray.500', textAlign: 'center' })}>
      구매한 포스트가 없어요
    </li>
  {/each}
</ul>
