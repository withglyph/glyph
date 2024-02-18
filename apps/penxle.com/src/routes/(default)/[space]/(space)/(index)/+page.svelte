<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import clsx from 'clsx';
  import { goto } from '$app/navigation';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Button, SpacePostCard } from '$lib/components';

  $: query = graphql(`
    query SpacePage_Query($slug: String!) {
      space(slug: $slug) {
        id
        name
        slug
        description

        icon {
          id
          url
        }

        meAsMember {
          id
        }

        posts {
          id

          ...SpaceFeed_post
        }
      }
    }
  `);

  const createPost = graphql(`
    mutation SpacePage_CreatePost_Mutation($input: CreatePostInput!) {
      createPost(input: $input) {
        id
        permalink
      }
    }
  `);
</script>

<Helmet
  description={$query.space.description ?? '펜슬로그 스페이스'}
  image={{ src: $query.space.icon.url, size: 'small' }}
  title={`홈 | ${$query.space.name}`}
/>

<article
  class={clsx(
    'w-full min-h-11rem max-w-50rem flex flex-col items-center py-6.5 grow <sm:(p-0 gap-2 bg-surface-primary)',
    $query.space.posts.length === 0 && 'center',
  )}
>
  {#if $query.space.posts.length === 0}
    <div class="flex flex-col center">
      <h2 class="body-15-b text-secondary">아직 스페이스에 업로드된 포스트가 없어요</h2>
      {#if $query.space.meAsMember}
        <Button
          class="mt-5"
          size="lg"
          on:click={async () => {
            const { permalink } = await createPost({ spaceId: $query.space.id });
            mixpanel.track('post:create', { via: 'space' });
            await goto(`/editor/${permalink}`);
          }}
        >
          포스트 작성하기
        </Button>
      {/if}
    </div>
  {:else}
    <ul class="w-full space-y-4 <sm:space-y-2">
      {#each $query.space.posts as post (post.id)}
        <li>
          <SpacePostCard $post={post} />
        </li>
      {/each}
    </ul>
  {/if}
</article>
