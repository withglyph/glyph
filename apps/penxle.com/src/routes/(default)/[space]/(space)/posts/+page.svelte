<script lang="ts">
  import IconPencil from '~icons/tabler/pencil';
  import { goto } from '$app/navigation';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Helmet, Icon } from '$lib/components';
  import { Button } from '$lib/components/v2';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import Post from '../../../(feed)/Post.svelte';

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
          '& > a': { paddingTop: '0' },
        },
        _after: { content: '""', display: 'block', height: '1px', backgroundColor: 'gray.100' },
        _lastOfType: { _after: { display: 'none' } },
      })}
    >
      <Post $post={post} showBookmark showDate showSpace />
    </li>
  {:else}
    <li class={css({ marginY: '32px' })}>
      <p class={css({ color: 'gray.500', textAlign: 'center' })}>스페이스에 업로드된 포스트가 없어요</p>
      {#if $query.space.meAsMember}
        <Button
          style={flex.raw({ align: 'center', gap: '4px', marginTop: '16px', marginX: 'auto' })}
          size="sm"
          variant="cyan-fill"
          on:click={async () => {
            const { permalink } = await createPost({ spaceId: $query.space.id });
            mixpanel.track('post:create', { via: 'space-home', spaceId: $query.space.id });
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
