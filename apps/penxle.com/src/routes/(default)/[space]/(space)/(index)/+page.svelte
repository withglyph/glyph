<script lang="ts">
  import IconPencil from '~icons/tabler/pencil';
  import IconPlus from '~icons/tabler/plus';
  import { goto } from '$app/navigation';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Helmet, Icon } from '$lib/components';
  import { CreateCollectionModal } from '$lib/components/pages/collections';
  import { Button } from '$lib/components/v2';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import PostCard from '../../../(feed)/PostCard.svelte';
  import Collection from '../Collection.svelte';

  let createCollectionOpen = false;

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

<h2 class={css({ marginTop: '14px', marginBottom: '8px', fontSize: { base: '13px', sm: '14px' }, color: 'gray.500' })}>
  포스트
</h2>

{#if $query.space.posts.length === 0}
  <div class={css({ marginY: '32px' })}>
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

<hr class={css({ border: 'none', marginY: '32px', height: '1px', backgroundColor: 'gray.100' })} />

<h2 class={css({ marginTop: '14px', marginBottom: '8px', fontSize: { base: '13px', sm: '14px' }, color: 'gray.500' })}>
  컬렉션
</h2>

{#if $query.space.collections.length === 0}
  <div class={css({ marginY: '32px' })}>
    <p class={css({ color: 'gray.500', textAlign: 'center' })}>스페이스에 업로드된 컬렉션이 없어요</p>
    {#if $query.space.meAsMember}
      <Button
        style={flex.raw({ align: 'center', gap: '4px', marginTop: '16px', marginX: 'auto' })}
        size="sm"
        variant="cyan-fill"
        on:click={() => (createCollectionOpen = true)}
      >
        <Icon icon={IconPlus} />
        새 컬렉션 만들기
      </Button>
    {/if}
  </div>
{:else}
  <ul class={flex({ align: 'center', gap: '12px', wrap: 'wrap', marginBottom: '20px' })}>
    {#each $query.space.collections.slice(0, 4) as collection (collection.id)}
      <li>
        <Collection $space={$query.space} $spaceCollection={collection} />
      </li>
    {/each}
  </ul>
{/if}

<CreateCollectionModal spaceId={$query.space.id} bind:open={createCollectionOpen} />
