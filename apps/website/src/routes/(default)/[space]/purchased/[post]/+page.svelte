<script lang="ts">
  import { graphql } from '$glitch';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import PostView from '../../PostView.svelte';

  $: query = graphql(`
    query SpacePurchasedPostPage_Query($permalink: String!) {
      post(permalink: $permalink) {
        id
        permalink

        space @_required {
          id
          slug
        }

        publishedRevision @_required {
          id
        }

        purchasedRevision @_required {
          id
          ...Post_postRevision
        }
      }

      ...Post_query
    }
  `);
</script>

{#if $query.post.publishedRevision.id !== $query.post.purchasedRevision.id}
  <div
    class={flex({
      direction: { base: 'row', sm: 'column' },
      align: 'center',
      justify: 'space-between',
      gap: '4px',
      paddingY: { base: '16px', sm: '14px' },
      paddingX: '20px',
      textAlign: 'center',
      backgroundColor: 'brand.50',
      width: 'full',
    })}
  >
    <p class={css({ fontSize: '13px', color: 'gray.600' })}>구매 이후 수정된 내역이 있어요</p>
    <a
      class={css({
        fontSize: '13px',
        fontWeight: 'medium',
        color: 'brand.400',
        textDecoration: 'underline',
        width: 'fit',
      })}
      href="/{$query.post.space.slug}/{$query.post.permalink}"
    >
      최신 버전 보기
    </a>
  </div>
{/if}

<PostView $postRevision={$query.post.purchasedRevision} {$query} />
