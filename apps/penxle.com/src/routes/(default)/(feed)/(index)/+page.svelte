<script lang="ts">
  import IconChevronLeft from '~icons/tabler/chevron-left';
  import IconChevronRight from '~icons/tabler/chevron-right';
  import { graphql } from '$glitch';
  import { Helmet, Icon, Image, Tag } from '$lib/components';
  import { css } from '$styled-system/css';
  import { flex, grid } from '$styled-system/patterns';
  import Post from '../Post.svelte';
  import PostCard from '../PostCard.svelte';
  import Carousel from './Carousel.svelte';
  import HorizontalScroll from './HorizontalScroll.svelte';

  $: query = graphql(`
    query IndexPage_Query {
      me {
        id

        profile {
          id
          name
        }
      }

      recommendFeed {
        id

        ...Feed_Post_post
        ...Feed_PostCard_post
      }

      recommendedTags {
        id
        name
      }

      featuredTagFeed {
        tag {
          id
          name
        }

        posts {
          id
          ...Feed_PostCard_post
        }
      }

      collectionFeed {
        id
        name

        thumbnail {
          id
          ...Image_image
        }

        space {
          id
          name
          slug

          icon {
            id
            ...Image_image
          }
        }
      }
    }
  `);

  let activeFeaturedTagId: string;
  $: if (!activeFeaturedTagId) {
    activeFeaturedTagId = $query.featuredTagFeed[0].tag.id;
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  $: activeFeaturedTagFeed = $query.featuredTagFeed.find(({ tag }) => tag.id === activeFeaturedTagId)!;
</script>

<svelte:head>
  <meta name="naver-site-verification" content="b127529850b2cea3fde71eaf9c43d5b6cbb76d42" />
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "글리프",
      "url": "https://withglyph.com"
    }
  </script>
</svelte:head>

<Helmet
  description="당신의 창작을 응원합니다. 만화, 소설, 일러스트, 영상 등 다양한 콘텐츠를 글리프에서 만나보세요."
  image={{ src: 'https://glyph.pub/assets/opengraph/default-cover-light.png', size: 'large' }}
  title="글리프 - 창작자를 위한 콘텐츠 플랫폼"
  titleSuffix=""
/>

<div class={css({ marginX: 'auto', paddingX: '20px', width: 'full', maxWidth: '1280px' })}>
  <Carousel />

  <HorizontalScroll
    style={css.raw({ gap: '10px', paddingY: '10px' })}
    gradientStyle={css.raw({ gradientFrom: '[#ffffff/0]', gradientTo: '[#ffffff]', height: '34px', width: '70px' })}
  >
    <Icon
      slot="left-icon"
      style={css.raw({ 'color': 'gray.5', '& *': { strokeWidth: '[2]' } })}
      icon={IconChevronLeft}
      size={20}
    />

    {#each $query.recommendedTags as tag, index (tag.id)}
      <Tag
        style={css.raw(
          { paddingX: '24px', color: 'gray.600', minWidth: 'fit', height: '34px' },
          index % 3 === 0 && { backgroundColor: 'gray.50' },
          index % 3 === 1 && { backgroundColor: 'gray.100' },
          index % 3 === 2 && { backgroundColor: 'gray.150' },
        )}
        href={`/tag/${tag.name}`}
      >
        #{tag.name}
      </Tag>
    {/each}

    <Icon
      slot="right-icon"
      style={css.raw({ 'color': 'gray.5', '& *': { strokeWidth: '[2]' } })}
      icon={IconChevronRight}
      size={20}
    />
  </HorizontalScroll>

  <div class={css({ paddingY: { base: '32px', sm: '40px' } })}>
    <h2 class={css({ marginBottom: '14px', fontSize: '21px', fontWeight: 'bold' })}>에디터 Pick</h2>

    <HorizontalScroll
      style={css.raw({ gap: { base: '12px', sm: '14px' } })}
      gradientStyle={css.raw({
        gradientFrom: '[#ffffff/0]',
        gradientTo: '[#ffffff]',
        display: 'flex',
        alignItems: 'center',
        height: '235px',
        width: '80px',
      })}
    >
      <Icon
        slot="left-icon"
        style={css.raw({ 'color': 'gray.5', '& *': { strokeWidth: '[2]' } })}
        icon={IconChevronLeft}
        size={20}
      />

      {#each $query.recommendFeed as post (post.id)}
        <PostCard style={css.raw({ width: { base: '200px', sm: '218px' } })} $post={post} />
      {/each}

      <Icon
        slot="right-icon"
        style={css.raw({ 'color': 'gray.5', '& *': { strokeWidth: '[2]' } })}
        icon={IconChevronRight}
        size={20}
      />
    </HorizontalScroll>
  </div>

  <div class={css({ paddingTop: { base: '32px', sm: '40px' }, paddingBottom: { base: '40px', sm: '60px' } })}>
    <div class={flex({ align: 'center', justify: 'space-between', marginBottom: '14px' })}>
      <h2 class={css({ fontSize: '21px', fontWeight: 'bold' })}>
        {$query.me ? `${$query.me.profile.name}님을 위한 추천` : '독자님을 위한 추천'}
      </h2>

      <!-- <button class={css({ color: 'gray.500' })} type="button">
        <Icon icon={IconRefresh} size={20} />
      </button> -->
    </div>

    <ul
      class={grid({
        display: 'grid',
        columns: { base: 1, sm: 2 },
        columnGap: '60px',
      })}
    >
      {#each $query.recommendFeed.slice(0, 3) as post, index (post.id)}
        <li
          class={css({
            sm: { _after: { content: '""', display: 'block', height: '1px', backgroundColor: 'gray.100' } },
          })}
        >
          <Post
            style={css.raw(index === 0 && { paddingTop: '0' }, index === 1 && { sm: { paddingTop: '0' } })}
            $post={post}
            showSpace
          />
        </li>
      {/each}
      {#each $query.recommendFeed.slice(3, 6) as post, index (post.id)}
        <li
          class={css(
            {
              hideBelow: 'sm',
            },
            index === 0 && {
              _after: { content: '""', display: 'block', height: '1px', backgroundColor: 'gray.100' },
            },
          )}
        >
          <Post $post={post} showSpace />
        </li>
      {/each}
    </ul>
  </div>
</div>

<div class={css({ paddingY: { base: '40px', sm: '60px' }, backgroundColor: 'gray.900' })}>
  <div class={css({ marginX: 'auto', paddingX: '20px', width: 'full', maxWidth: '1280px' })}>
    <h2
      class={css({
        marginBottom: '16px',
        fontSize: '21px',
        fontWeight: 'bold',
        color: 'gray.5',
      })}
    >
      지금 뜨는 태그
    </h2>

    <div
      class={flex({
        align: 'center',
        gap: '6px',
        marginBottom: { base: '20px', sm: '14px' },
        overflowX: 'auto',
        scrollbar: 'hidden',
      })}
    >
      {#each $query.featuredTagFeed as { tag } (tag.id)}
        <button
          class={flex({
            alignItems: 'center',
            paddingX: '12px',
            paddingY: '6px',
            minWidth: 'fit',
            height: 'fit',
            fontSize: '13px',
            fontWeight: 'medium',
            color: 'gray.300',
            backgroundColor: 'gray.800',
            transition: 'common',
            truncate: true,
            _hover: { opacity: '[0.8]' },
            _selected: {
              borderWidth: '0',
              backgroundColor: 'gray.50',
              color: 'gray.900',
            },
          })}
          aria-selected={tag.id === activeFeaturedTagId}
          role="tab"
          type="button"
          on:click={() => (activeFeaturedTagId = tag.id)}
        >
          #{tag.name}
        </button>
      {/each}
    </div>

    <div class={grid({ columns: { base: 2, sm: 5 }, columnGap: '14px', rowGap: '36px' })}>
      {#each activeFeaturedTagFeed.posts.slice(0, 6) as post (post.id)}
        <PostCard $post={post} showTags theme="dark" />
      {/each}
      {#each activeFeaturedTagFeed.posts.slice(6, 10) as post (post.id)}
        <PostCard style={css.raw({ hideBelow: 'sm' })} $post={post} showTags theme="dark" />
      {/each}
    </div>
  </div>
</div>

<div class={css({ marginX: 'auto', paddingX: '20px', width: 'full', maxWidth: '1280px' })}>
  <div class={css({ paddingTop: { base: '40px', sm: '60px' } })}>
    <h2 class={css({ marginBottom: '14px', fontSize: '21px', fontWeight: 'bold' })}>많이 찾은 컬렉션</h2>

    <ul class={css({ sm: { display: 'grid', gridTemplateColumns: '3', columnGap: '10px' } })}>
      {#each $query.collectionFeed.slice(0, 6) as collection (collection.id)}
        <li
          class={css({
            smDown: { _firstOfType: { '& > a': { paddingTop: '0' } } },
          })}
        >
          <a
            class={flex({
              align: 'center',
              gap: '14px',
              paddingY: { base: '16px', sm: '24px' },
            })}
            href="/{collection.space.slug}/collections/{collection.id}"
          >
            <Image
              style={css.raw({
                borderWidth: '[0.8px]',
                borderColor: 'gray.100',
                flex: 'none',
                width: { base: '48px', sm: '60px' },
                aspectRatio: '3/4',
              })}
              $image={collection.thumbnail}
              placeholder
            />

            <div class={css({ truncate: true })}>
              <h3
                class={css({
                  marginBottom: '2px',
                  fontSize: '14px',
                  fontWeight: 'semibold',
                  truncate: true,
                })}
              >
                {collection.name}
              </h3>

              <div class={flex({ align: 'center', gap: '4px', truncate: true })}>
                <Image
                  style={css.raw({
                    flex: 'none',
                    borderWidth: '[0.8px]',
                    borderColor: 'gray.100',
                    size: '18px',
                  })}
                  $image={collection.space.icon}
                  placeholder
                />

                <span class={css({ fontSize: '12px', color: 'gray.600', truncate: true })}>
                  {collection.space.name}
                </span>
              </div>
            </div>
          </a>
        </li>
      {/each}
      {#each $query.collectionFeed.slice(6, 9) as collection (collection.id)}
        <li
          class={css({
            _firstOfType: { '& > a': { paddingTop: '0' } },
            hideBelow: 'sm',
          })}
        >
          <a
            class={flex({
              align: 'center',
              gap: '14px',
              paddingY: { base: '16px', sm: '24px' },
            })}
            href="/{collection.space.slug}/collections/{collection.id}"
          >
            <Image
              style={css.raw({
                borderWidth: '[0.8px]',
                borderColor: 'gray.100',
                flex: 'none',
                width: { base: '48px', sm: '60px' },
                aspectRatio: '3/4',
              })}
              $image={collection.thumbnail}
              placeholder
            />

            <div class={css({ truncate: true })}>
              <h3
                class={css({
                  marginBottom: '2px',
                  fontSize: '14px',
                  fontWeight: 'semibold',
                  truncate: true,
                })}
              >
                {collection.name}
              </h3>

              <div class={flex({ align: 'center', gap: '4px', truncate: true })}>
                <Image
                  style={css.raw({
                    flex: 'none',
                    borderWidth: '[0.8px]',
                    borderColor: 'gray.100',
                    size: '18px',
                  })}
                  $image={collection.space.icon}
                  placeholder
                />

                <span class={css({ fontSize: '12px', color: 'gray.600', truncate: true })}>
                  {collection.space.name}
                </span>
              </div>
            </div>
          </a>
        </li>
      {/each}
    </ul>
  </div>
</div>
