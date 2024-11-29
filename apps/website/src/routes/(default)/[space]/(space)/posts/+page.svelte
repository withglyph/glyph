<script lang="ts">
  import IconPencil from '~icons/tabler/pencil';
  import { goto } from '$app/navigation';
  import { graphql } from '$glitch';
  import { analytics } from '$lib/analytics';
  import { Button, Helmet, Icon, Post } from '$lib/components';
  import { css } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';

  $: query = graphql(`
    query SpacePostsPage_Query($slug: String!) {
      space(slug: $slug) {
        id
        name
        slug
        description
        postCount

        icon {
          id
          url
        }

        meAsMember {
          id
        }

        posts {
          id

          ...Feed_Post_post
        }
      }

      ...Feed_Post_query
    }
  `);

  const createPost = graphql(`
    mutation SpacePostsPage_CreatePost_Mutation($input: CreatePostInput!) {
      createPost(input: $input) {
        id
        permalink
      }
    }
  `);
</script>

<Helmet
  description={$query.space.description ?? `글리프의 ${$query.space.name} 스페이스`}
  image={{ src: $query.space.icon.url, size: 'small' }}
  title={$query.space.name}
/>

<p class={css({ marginTop: '14px', marginBottom: '8px', fontSize: '13px', color: 'gray.500' })}>
  총 {$query.space.postCount}개의 포스트
</p>

<ul class={flex({ direction: 'column', width: 'full' })}>
  {#each $query.space.posts as post (post.id)}
    <li
      class={css({
        _firstOfType: {
          '& > div > a': { marginTop: '8px', paddingTop: '0' },
        },
        _after: { content: '""', display: 'block', height: '1px', backgroundColor: 'gray.50' },
        _lastOfType: { _after: { display: 'none' } },
      })}
    >
      <Post $post={post} {$query} showBookmark showDate showSpace />
    </li>
  {:else}
    <li class={css({ marginY: '32px' })}>
      <p class={css({ fontSize: '14px', color: 'gray.500', textAlign: 'center' })}>
        스페이스에 업로드된 포스트가 없어요
      </p>
      {#if $query.space.meAsMember}
        <Button
          style={center.raw({ gap: '4px', marginTop: '16px', marginX: 'auto', width: '142px' })}
          size="sm"
          variant="brand-fill"
          on:click={async () => {
            const { permalink } = await createPost({ spaceId: $query.space.id });
            analytics.track('post:create', { via: 'space-home', spaceId: $query.space.id });
            await goto(`/editor/${permalink}`);
          }}
        >
          <Icon icon={IconPencil} />
          첫 포스트 작성하기
        </Button>
      {/if}
    </li>
  {/each}
</ul>
