<script lang="ts">
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { PostCard, Tag } from '$lib/components';
  import { toast } from '$lib/notification';

  type Tag = {
    tag: {
      id: string;
      name: string;
    };
  };

  $: query = graphql(`
    query FeedFollowTagsPage_Query {
      me @_required {
        id

        followedTags {
          id
          name
        }
      }

      tagFeed {
        id
        ...Feed_post

        tags {
          id

          tag {
            id
            name
          }
        }
      }

      recentlyUsedTags {
        id
        name
        followed
      }
    }
  `);

  const followTag = graphql(`
    mutation FeedFollowTagsPage_FollowTag_Mutation($input: FollowTagInput!) {
      followTag(input: $input) {
        id
        followed
      }
    }
  `);

  const unfollowTag = graphql(`
    mutation FeedFollowTagsPage_UnfollowTag_Mutation($input: UnfollowTagInput!) {
      unfollowTag(input: $input) {
        id
        followed
      }
    }
  `);

  const getFollowedTags = (tags: Tag[] | undefined) => {
    const followedTags = new Set<string>($query.me.followedTags.map((tag) => tag.name));
    const postTags = new Set<string>(tags?.map((tag: Tag) => tag.tag.name));

    const intersection = new Set([...followedTags].filter((x) => postTags.has(x)));
    return [...intersection];
  };
</script>

{#if $query.tagFeed.length === 0}
  <div class="flex flex-col center grow sm:max-h-120 my-10">
    <p class="body-15-b text-center">
      관심 태그가 추가되어있지 않아
      <br />
      목록을 불러올 수 없어요 관심 태그를 추가해보세요!
    </p>
    <div class="flex flex-wrap gap-3 mt-5 center">
      {#each $query.recentlyUsedTags.slice(0, 4) as tag (tag.id)}
        {#if tag.followed}
          <button
            class="py-1.5 px-2 rounded-12 body-13-m border border-secondary flex items-center gap-1"
            type="button"
            on:click={async () => {
              await unfollowTag({ tagId: tag.id });
              mixpanel.track('tag:unfollow', { tagId: tag.id, via: 'feed' });
              toast.success('관심 태그 해제되었어요');
            }}
          >
            <i class="i-lc-check" />
            {tag.name}
          </button>
        {:else}
          <button
            class="bg-gray-80 border border-gray-80 py-1.5 px-2 rounded-12 body-13-m text-gray-5"
            type="button"
            on:click={async () => {
              await followTag({ tagId: tag.id });
              mixpanel.track('tag:follow', { tagId: tag.id, via: 'feed' });
              toast.success('관심 태그에 추가했어요');
            }}
          >
            <i class="i-lc-plus" />
            {tag.name}
          </button>
        {/if}
      {/each}
    </div>
  </div>
{/if}

<ul>
  {#each $query.tagFeed as post (post.id)}
    <li class="mb-4 <sm:first-of-type:mt-4">
      <div class="flex items-center flex-wrap gap-2 mb-4 truncate <sm:mx-2">
        {#each getFollowedTags(post.tags) as tag (tag)}
          <Tag href="/tag/{tag}">#{tag}</Tag>
        {/each}
      </div>

      <PostCard $post={post} />
    </li>
  {/each}
</ul>
