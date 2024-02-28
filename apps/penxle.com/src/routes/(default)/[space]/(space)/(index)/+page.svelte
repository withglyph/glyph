<script lang="ts">
  import IconAlertTriangle from '~icons/tabler/alert-triangle';
  import { goto } from '$app/navigation';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Button, Helmet, Icon, SpacePostCard } from '$lib/components';
  import { css } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';

  $: query = graphql(`
    query SpacePage_Query($slug: String!) {
      space(slug: $slug) {
        id
        name
        slug
        description

        myMasquerade {
          id
          blocked
        }

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
  description={$query.space.description ?? `펜슬의 ${$query.space.name} 스페이스`}
  image={{ src: $query.space.icon.url, size: 'small' }}
  title={$query.space.name}
/>

<article
  class={css(
    {
      flexDirection: 'column',
      alignItems: 'center',
      flexGrow: '1',
      paddingY: '26px',
      width: 'full',
      maxWidth: '800px',
      minHeight: '176px',
      smDown: { gap: '8px', padding: '0', background: 'gray.100' },
    },
    ($query.space.posts.length === 0 || $query.space.myMasquerade?.blocked) && {
      justifyContent: 'center',
      alignItems: 'center',
      gap: '0',
    },
  )}
>
  {#if $query.space.myMasquerade?.blocked}
    <Icon style={css.raw({ size: '28px' })} icon={IconAlertTriangle} />
    <p class={css({ marginTop: '4px', marginBottom: '2px', fontSize: '18px', fontWeight: 'semibold' })}>
      차단당했습니다
    </p>
    <p class={css({ fontSize: '14px', color: 'gray.500' })}>{$query.space.name}의 게시물을 볼 수 없어요</p>
  {:else if $query.space.posts.length === 0}
    <div class={center({ flexDirection: 'column' })}>
      <h2 class={css({ fontSize: '15px', fontWeight: 'bold', color: 'gray.500' })}>
        아직 스페이스에 업로드된 포스트가 없어요
      </h2>
      {#if $query.space.meAsMember}
        <Button
          style={css.raw({ marginTop: '20px' })}
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
    <ul class={flex({ direction: 'column', gap: { base: '8px', sm: '16px' }, width: 'full' })}>
      {#each $query.space.posts as post (post.id)}
        <li>
          <SpacePostCard $post={post} />
        </li>
      {/each}
    </ul>
  {/if}
</article>
