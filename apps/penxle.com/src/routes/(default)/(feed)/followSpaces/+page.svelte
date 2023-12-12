<script lang="ts">
  import { Link } from '@penxle/ui';
  import { graphql } from '$glitch';
  import { Feed } from '$lib/components';

  $: query = graphql(`
    query FeedFollowSpacesPage_Query {
      spaceFeed {
        id
        ...Feed_post
      }
    }
  `);
</script>

{#if $query.spaceFeed.length === 0}
  <div class="flex flex-col center grow max-h-120 my-10">
    <p class="body-15-b text-center">
      관심 스페이스가 없어요
      <br />
      가장 먼저 펜슬 공식 스페이스를 방문해보세요!
    </p>

    <Link class="flex truncate bg-cardprimary p-2 rounded-lg mt-6 w-70" href="/penxle">
      <i class="i-px-logo square-10.5 rounded-xl mr-3 flex-none" />
      <div class="grow basis-0 truncate">
        <p class="body-15-b truncate">펜슬 공식 스페이스</p>
        <p class="body-13-m text-secondary truncate">함께 그리는 반짝임, 펜슬!</p>
      </div>
    </Link>
  </div>
{/if}

{#each $query.spaceFeed as post (post.id)}
  <Feed class="mb-8" $post={post} showSpaceInfoMessage />
{/each}
