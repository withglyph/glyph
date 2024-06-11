<script lang="ts">
  import IconChevronRight from '~icons/tabler/chevron-right';
  import IconPencil from '~icons/tabler/pencil';
  import IconShare2 from '~icons/tabler/share-2';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Button, Helmet, Icon, Image, Post, ShareLinkPopover } from '$lib/components';
  import { comma } from '$lib/utils';
  import { css } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';

  $: query = graphql(`
    query SpaceCollectionsEntityPage_Query($slug: String!, $order: SpaceCollectionPostOrderByKind!) {
      spaceCollection(slug: $slug) {
        id
        name
        description
        count

        thumbnail {
          id
          ...Image_image
        }

        posts(order: $order) {
          id
          permalink

          ...Feed_Post_post
        }

        space {
          id
          slug
          name

          members {
            id

            profile {
              id
              name
            }
          }

          meAsMember {
            id
          }
        }
      }

      ...Feed_Post_query
    }
  `);

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
  description={`${$query.spaceCollection.space.name} 스페이스의 ${$query.spaceCollection.name} 컬렉션`}
  title={`${$query.spaceCollection.space.name}의 ${$query.spaceCollection.name}`}
/>

<main
  class={flex({
    direction: 'column',
    align: 'center',
    grow: '1',
    paddingBottom: { base: '96px', sm: '120px' },
    width: 'full',
  })}
>
  <div
    class={css({
      backgroundGradient: 'to-b',
      gradientFrom: 'gray.50',
      gradientTo: 'gray.150',
      width: 'full',
      height: { base: '100px', sm: '182px' },
    })}
  />

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
            flex: 'none',
            borderWidth: '[0.8px]',
            borderColor: 'gray.100',
            width: { base: '84px', sm: '184px' },
            marginTop: { base: '-63px', sm: '-46px' },
            aspectRatio: '3/4',
            objectFit: 'cover',
          })}
          $image={$query.spaceCollection.thumbnail}
          placeholder
          size={256}
        />
        <div class={css({ marginTop: 'auto', smDown: { paddingY: '14px' } })}>
          <a
            class={flex({
              align: 'center',
              gap: '3px',
              marginBottom: '6px',
              fontSize: '14px',
              color: 'gray.500',
              width: 'fit',
            })}
            href="/{$query.spaceCollection.space.slug}"
          >
            {$query.spaceCollection.space.name}
            <Icon icon={IconChevronRight} />
          </a>

          <h1 class={css({ fontSize: { base: '20px', sm: '24px' }, fontWeight: 'bold' })}>
            {$query.spaceCollection.name}
          </h1>

          <p class={css({ fontSize: '14px' })}>
            by {$query.spaceCollection.space.members[0].profile.name}
          </p>

          {#if $query.spaceCollection.description}
            <p
              class={css({
                marginTop: '8px',
                fontSize: '13px',
                color: 'gray.500',
                minHeight: '38px',
                wordBreak: 'break-all',
              })}
            >
              {$query.spaceCollection.description}
            </p>
          {/if}

          <div class={flex({ align: 'center', gap: '8px', marginTop: '16px' })}>
            {#if $query.spaceCollection.space.meAsMember}
              <Button
                style={css.raw({ width: '110px', height: '37px' })}
                href="/{$query.spaceCollection.space.slug}/dashboard/collections"
                size="sm"
                type="link"
              >
                컬렉션 관리
              </Button>
            {:else}
              <Button
                style={css.raw({ width: '110px', height: '37px' })}
                href="/{$query.spaceCollection.space.slug}/collections"
                size="sm"
                type="link"
                variant="gray-outline"
              >
                다른 컬렉션 보기
              </Button>
            {/if}

            <ShareLinkPopover
              href="{$page.url.origin}/{$query.spaceCollection.space.slug}/collections/{$query.spaceCollection.id}"
            >
              <div class={center({ outlineWidth: '1px', outlineColor: 'gray.200', size: '37px' })}>
                <Icon icon={IconShare2} />
              </div>
            </ShareLinkPopover>
          </div>
        </div>
      </div>

      <div class={flex({ justify: 'space-between' })}>
        <dl
          class={css({
            display: 'flex',
            alignItems: 'flex-end',
            gap: '4px',
            fontSize: '12px',
            color: 'gray.500',
          })}
        >
          <dt>포스트</dt>
          <dd>{comma($query.spaceCollection.count)}개</dd>
        </dl>

        <div
          class={flex({
            align: 'center',
            justifyContent: 'flex-end',
            gap: '6px',
            fontSize: '14px',
          })}
        >
          <a
            class={css(
              { paddingY: '8px', color: 'gray.400' },
              $page.url.searchParams.get('order') !== 'OLDEST' && { fontWeight: 'semibold', color: 'gray.900' },
            )}
            href="?order=LATEST"
          >
            최신화부터
          </a>
          <hr class={css({ border: 'none', width: '1px', height: '10px', backgroundColor: 'gray.100' })} />
          <a
            class={css(
              { paddingY: '8px', color: 'gray.400' },
              $page.url.searchParams.get('order') === 'OLDEST' && { fontWeight: 'semibold', color: 'gray.900' },
            )}
            href="?order=OLDEST"
          >
            1화부터
          </a>
        </div>
      </div>

      <ul>
        {#each $query.spaceCollection.posts as post (post.id)}
          <li
            class={css({
              _after: { content: '""', display: 'block', height: '1px', backgroundColor: 'gray.50' },
              _lastOfType: {
                _after: { display: 'none' },
              },
            })}
          >
            <Post $post={post} {$query} showBookmark showDate showSpace />
          </li>
        {:else}
          <li class={css({ marginY: '50px', textAlign: 'center', color: 'gray.400', fontWeight: 'semibold' })}>
            컬렉션에 업로드된 포스트가 없어요
            {#if $query.spaceCollection.space.meAsMember}
              <Button
                style={flex.raw({ align: 'center', gap: '4px', marginTop: '16px', marginX: 'auto' })}
                variant="brand-fill"
                on:click={async () => {
                  const { permalink } = await createPost({
                    spaceId: $query.spaceCollection.space.id,
                    collectionId: $query.spaceCollection.id,
                  });
                  mixpanel.track('post:create', {
                    via: 'space-collection-home',
                    spaceId: $query.spaceCollection.space.id,
                    collectionId: $query.spaceCollection.id,
                  });
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
