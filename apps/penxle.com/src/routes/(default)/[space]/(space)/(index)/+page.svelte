<script lang="ts">
  import IconChevronRight from '~icons/tabler/chevron-right';
  import IconPencil from '~icons/tabler/pencil';
  import IconPlus from '~icons/tabler/plus';
  import { goto } from '$app/navigation';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Helmet, Icon } from '$lib/components';
  import { Button } from '$lib/components/v2';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import PostCard from '../../../(index)/PostCard.svelte';
  import Collection from '../Collection.svelte';

  $: query = graphql(`
    query SpacePage_Query($slug: String!) {
      space(slug: $slug) {
        id
        name
        slug
        description

        collections {
          id
          ...SpacePage_Collection_spaceCollection
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
          ...Feed_PostCard_post
        }

        ...SpacePage_Collection_space
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
  description={$query.space.description ?? `글리프의 ${$query.space.name} 스페이스`}
  image={{ src: $query.space.icon.url, size: 'small' }}
  title={$query.space.name}
/>

<div class={flex({ align: 'center', justify: 'space-between', marginTop: '14px' })}>
  <a href={`/${$query.space.slug}/posts`}>
    <h2 class={css({ fontSize: { base: '16px', sm: '18px' }, fontWeight: { base: 'semibold', sm: 'bold' } })}>
      포스트
    </h2>
  </a>
  <a href={`/${$query.space.slug}/posts`}>
    <Icon icon={IconChevronRight} size={24} />
  </a>
</div>

{#if $query.space.posts.length === 0}
  <div class={css({ marginY: '50px' })}>
    <p class={css({ fontWeight: 'semibold', color: 'gray.400', textAlign: 'center' })}>
      스페이스에 업로드된 포스트가 없어요
    </p>
    {#if $query.space.meAsMember}
      <Button
        style={flex.raw({ align: 'center', gap: '4px', marginTop: '16px', marginX: 'auto' })}
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
  </div>
{:else}
  <ul class={flex({ align: 'center', gap: '12px', wrap: 'wrap' })}>
    {#each $query.space.posts.slice(0, 4) as post (post.id)}
      <li>
        <PostCard style={css.raw({ width: { base: '162px', sm: '206px' } })} $post={post} showTags />
      </li>
    {/each}
  </ul>
{/if}

<div class={flex({ align: 'center', justify: 'space-between', marginTop: '14px' })}>
  <a href={`/${$query.space.slug}/collections`}>
    <h2 class={css({ fontSize: { base: '16px', sm: '18px' }, fontWeight: { base: 'semibold', sm: 'bold' } })}>
      컬렉션
    </h2>
  </a>
  <a href={`/${$query.space.slug}/collections`}>
    <Icon icon={IconChevronRight} size={24} />
  </a>
</div>

{#if $query.space.collections.length === 0}
  <div class={css({ marginY: '50px' })}>
    <p class={css({ fontWeight: 'semibold', color: 'gray.400', textAlign: 'center' })}>
      스페이스에 업로드된 컬렉션이 없어요
    </p>
    {#if $query.space.meAsMember}
      <Button style={flex.raw({ align: 'center', gap: '4px', marginTop: '16px', marginX: 'auto' })} variant="cyan-fill">
        <Icon icon={IconPlus} />
        새 컬렉션 만들기
      </Button>
    {/if}
  </div>
{:else}
  <ul class={flex({ align: 'center', gap: '12px', wrap: 'wrap', marginTop: '14px', marginBottom: '20px' })}>
    {#each $query.space.collections.slice(0, 4) as collection (collection.id)}
      <li>
        <Collection $space={$query.space} $spaceCollection={collection} />
      </li>
    {/each}
  </ul>
{/if}
