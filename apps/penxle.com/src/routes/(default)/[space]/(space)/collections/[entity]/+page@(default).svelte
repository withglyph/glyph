<script lang="ts">
  import IconChevronRight from '~icons/tabler/chevron-right';
  import IconPencil from '~icons/tabler/pencil';
  import IconShare2 from '~icons/tabler/share-2';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Helmet, Icon, Image, ShareLinkPopover } from '$lib/components';
  import { Button } from '$lib/components/v2';
  import { css } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';
  import Post from '../../../../(index)/Post.svelte';

  $: query = graphql(`
    query SpaceCollectionsEntityPage_Query($slug: String!) {
      me {
        id
      }

      space(slug: $slug) {
        id
        slug
        name
        followed
        description

        members {
          id

          profile {
            id
            name
          }
        }

        posts {
          id
          collection {
            id
          }

          ...SpaceCollectionsEntityPage_ManageCollectionModal_post
        }

        icon {
          ...Image_image
        }

        collections {
          id
          name
          count

          thumbnail {
            id
            url
            ...Image_image
          }

          posts {
            id
            permalink

            ...Feed_Post_post
          }

          ...SpaceCollectionsEntityPage_ManageCollectionModal_collection
        }

        meAsMember {
          id
        }
      }
    }
  `);
  $: collectionId = $page.params.entity;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  $: collection = $query.space.collections.find(({ id }) => id === collectionId)!;

  const createPost = graphql(`
    mutation SpaceCollectionsEntityPage_CreatePost_Mutation($input: CreatePostInput!) {
      createPost(input: $input) {
        id
        permalink
      }
    }
  `);
</script>

<Helmet
  description={`${$query.space.name} 스페이스의 ${collection.name} 컬렉션`}
  title={`${$query.space.name}의 ${collection.name}`}
/>

<main
  class={flex({
    direction: 'column',
    align: 'center',
    grow: '1',
    paddingBottom: { base: '96px', sm: '120px' },
    width: 'full',
    background: 'gray.5',
  })}
>
  <div class={css({ backgroundColor: 'gray.50', width: 'full', height: { base: '100px', sm: '180px' } })} />

  <div class={css({ paddingX: '20px', width: 'full' })}>
    <div class={flex({ direction: 'column', flexGrow: '1', marginX: 'auto', width: 'full', maxWidth: '860px' })}>
      <div
        class={flex({
          marginBottom: { base: '10px', sm: '32px' },
          smDown: { flexDirection: 'column' },
          sm: { gap: '20px' },
        })}
      >
        <Image
          style={css.raw({
            borderWidth: '[0.8px]',
            borderColor: 'gray.100',
            width: { base: '84px', sm: '240px' },
            marginTop: { base: '-63px', sm: '-77px' },
            aspectRatio: '[4/5]',
          })}
          $image={collection.thumbnail}
          placeholder
        />
        <div class={css({ marginTop: 'auto', smDown: { paddingY: '14px' } })}>
          <a
            class={flex({
              align: 'center',
              gap: '4px',
              marginBottom: '6px',
              fontSize: { base: '14px', sm: '16px' },
              color: 'gray.500',
              width: 'fit',
            })}
            href="/{$query.space.slug}"
          >
            {$query.space.name}
            <Icon icon={IconChevronRight} />
          </a>

          <h1 class={css({ fontSize: { base: '20px', sm: '28px' }, fontWeight: 'bold' })}>
            {collection.name}
          </h1>

          <p class={css({ fontSize: { base: '14px', sm: '20px' } })}>
            by {$query.space.members[0].profile.name}
          </p>

          <div class={flex({ align: 'center', gap: '8px', marginTop: '20px' })}>
            <Button
              style={css.raw({ width: '96px', height: '37px' })}
              disabled={collection.posts.length === 0}
              href={collection.posts.length > 0 ? `/${$query.space.slug}/${collection.posts[0].permalink}` : undefined}
              size="sm"
              type="link"
            >
              첫 회 보기
            </Button>

            {#if $query.space.meAsMember}
              <Button
                style={css.raw({ width: '96px', height: '37px' })}
                href="/{$query.space.slug}/dashboard/posts/collections"
                size="sm"
                type="link"
                variant="gray-outline"
              >
                컬렉션 관리
              </Button>
            {:else}
              <Button
                style={css.raw({ minWidth: '96px', height: '37px' })}
                href="/{$query.space.slug}/collections"
                size="sm"
                type="link"
                variant="gray-outline"
              >
                다른 컬렉션 보기
              </Button>
            {/if}

            <ShareLinkPopover href="{location.origin}/{$query.space.slug}/collections/{collection.id}">
              <div class={center({ outlineWidth: '1px', outlineColor: 'gray.200', size: '37px' })}>
                <Icon icon={IconShare2} />
              </div>
            </ShareLinkPopover>
          </div>
        </div>
      </div>

      <p class={css({ marginTop: '14px', fontSize: '13px', color: 'gray.500' })}>총 {collection.count}개의 포스트</p>

      <ul>
        {#each collection.posts as post (post.id)}
          <li>
            <Post $post={post} showBookmark />
          </li>
        {:else}
          <li class={css({ marginY: '50px', textAlign: 'center', color: 'gray.400', fontWeight: 'semibold' })}>
            컬렉션에 업로드된 포스트가 없어요
            {#if $query.space.meAsMember}
              <Button
                style={flex.raw({ align: 'center', gap: '4px', marginTop: '16px', marginX: 'auto' })}
                variant="cyan-fill"
                on:click={async () => {
                  const { permalink } = await createPost({ spaceId: $query.space.id });
                  mixpanel.track('post:create', { via: 'space-collection-home', spaceId: $query.space.id, collection });
                  await goto(`/editor/${permalink}`);
                }}
              >
                <Icon icon={IconPencil} />
                포스트 작성하기
              </Button>
            {/if}
          </li>
        {/each}
      </ul>
    </div>
  </div>
</main>
