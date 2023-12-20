<script lang="ts">
  import { graphql } from '$glitch';
  import { PostCard } from '$lib/components';

  $: query = graphql(`
    query MeCabinetsBookmarkPage_Query {
      me @_required {
        id

        bookmarks {
          id
          name
          postCount

          posts {
            id

            post {
              id
              ...Feed_post
            }
          }
        }
      }
    }
  `);
</script>

<div class="bg-white w-full flex center h-15 border-b border-secondary <sm:hidden">
  <a href="/me/cabinets">
    <i class="i-lc-chevron-left square-6 text-secondary" />
  </a>
  <h1 class="title-20-b w-full text-center max-w-200">북마크</h1>
</div>

<div class="my-7 w-full max-w-200">
  <p class="subtitle-18-eb">{$query.me.bookmarks[0].postCount}개의 포스트</p>

  <div class="mt-9">
    {#each $query.me.bookmarks[0].posts as { post } (post.id)}
      <PostCard class="mb-11.5 last-of-type:mb-0" $post={post} showSpaceInfoMessage />
    {/each}
  </div>
</div>
