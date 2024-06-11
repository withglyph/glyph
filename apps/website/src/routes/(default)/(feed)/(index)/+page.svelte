<script lang="ts">
  import IconChevronLeft from '~icons/tabler/chevron-left';
  import IconChevronRight from '~icons/tabler/chevron-right';
  import { graphql } from '$glitch';
  import { AdSense, Helmet, Icon, Image, Post, PostCard, Tag } from '$lib/components';
  import { categoryFilter } from '$lib/const/feed';
  import { css } from '$styled-system/css';
  import { flex, grid } from '$styled-system/patterns';
  import Carousel from './Carousel.svelte';
  import DraftPost from './DraftPost.svelte';
  import HorizontalScroll from './HorizontalScroll.svelte';

  $: query = graphql(`
    query IndexPage_Query {
      featureFlags

      me {
        id

        profile {
          id
          name
        }

        posts(state: DRAFT) {
          id
          ...DraftPost_post
        }
      }

      challengeFeed {
        id

        ...Feed_PostCard_post
      }

      recommendFeed {
        id

        ...Feed_Post_post
      }

      recommendedTags {
        id
        name
      }

      featuredTagFeed {
        __typename

        ... on FeaturedTag {
          tag {
            id
            name
          }

          posts {
            id
            ...Feed_PostCard_post
          }
        }

        ... on FeaturedCategory {
          categoryId

          posts {
            id
            ...Feed_PostCard_post
          }
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

      ...Feed_Post_query
    }
  `);

  let activeFeaturedTagId: string;
  $: if (!activeFeaturedTagId) {
    activeFeaturedTagId =
      $query.featuredTagFeed[0].__typename === 'FeaturedCategory'
        ? $query.featuredTagFeed[0].categoryId
        : $query.featuredTagFeed[0].tag.id;
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  $: activeFeaturedTagFeed = $query.featuredTagFeed.find((feed) => {
    if (feed.__typename === 'FeaturedTag') {
      return feed.tag.id === activeFeaturedTagId;
    } else if (feed.__typename === 'FeaturedCategory') {
      return feed.categoryId === activeFeaturedTagId;
    } else {
      return false;
    }
  })!;
</script>

<Helmet
  description="당신의 창작을 응원합니다. 만화, 소설, 일러스트, 영상 등 다양한 콘텐츠를 글리프에서 만나보세요."
  image={{ src: 'https://glyph.pub/assets/opengraph/default-cover-light.png', size: 'large' }}
  struct={{
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': '글리프',
    'alternateName': 'Glyph',
    'url': 'https://withglyph.com/',
  }}
  title="글리프 - 창작자를 위한 콘텐츠 플랫폼"
  titleSuffix=""
/>

<div class={css({ marginX: 'auto', paddingX: '20px', width: 'full', maxWidth: '1280px' })}>
  <Carousel />

  <HorizontalScroll
    style={css.raw({ gap: '10px', paddingY: '10px' })}
    gradientStyle={css.raw({ gradientFrom: '[#ffffff/0]', gradientTo: '[#ffffff]', height: '33px', width: '70px' })}
  >
    <Icon
      slot="left-icon"
      style={css.raw({ 'color': 'gray.0', '& *': { strokeWidth: '[2]' } })}
      icon={IconChevronLeft}
      size={20}
    />

    {#each $query.recommendedTags as tag (tag.id)}
      <Tag
        style={css.raw({
          paddingX: '24px',
          paddingY: '7px',
          color: 'gray.600',
          backgroundColor: 'gray.50',
          minWidth: 'fit',
        })}
        href={`/tag/${tag.name}`}
        theme="light"
      >
        #{tag.name}
      </Tag>
    {/each}

    <Icon
      slot="right-icon"
      style={css.raw({ 'color': 'gray.0', '& *': { strokeWidth: '[2]' } })}
      icon={IconChevronRight}
      size={20}
    />
  </HorizontalScroll>

  {#if $query.me && $query.me.posts.length > 0}
    <div class={css({ paddingY: { base: '32px', sm: '40px' } })}>
      <h2 class={css({ marginBottom: '14px', fontSize: '21px', fontWeight: 'bold' })}>이어서 써보세요</h2>

      <HorizontalScroll
        style={css.raw({ gap: '12px' })}
        gradientStyle={css.raw({
          gradientFrom: '[#ffffff/0]',
          gradientTo: '[#ffffff]',
          display: 'flex',
          alignItems: 'center',
          height: { base: '138px', sm: '140px' },
          width: '80px',
        })}
      >
        <Icon
          slot="left-icon"
          style={css.raw({ 'color': 'gray.0', '& *': { strokeWidth: '[2]' } })}
          icon={IconChevronLeft}
          size={20}
        />

        {#each $query.me.posts.slice(0, 10) as post (post.id)}
          <DraftPost $post={post} />
        {/each}

        <Icon
          slot="right-icon"
          style={css.raw({ 'color': 'gray.0', '& *': { strokeWidth: '[2]' } })}
          icon={IconChevronRight}
          size={20}
        />
      </HorizontalScroll>
    </div>
  {/if}

  <div
    class={css(
      { paddingY: { base: '32px', sm: '40px' } },
      $query.me &&
        $query.me.posts.length > 0 && {
          paddingTop: { base: '24px', sm: '20px' },
        },
    )}
  >
    <h2 class={css({ marginBottom: '14px', fontSize: '21px', fontWeight: 'bold' })}>이번주 챌린지 🎸</h2>

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
        style={css.raw({ 'color': 'gray.0', '& *': { strokeWidth: '[2]' } })}
        icon={IconChevronLeft}
        size={20}
      />

      {#each $query.challengeFeed as post (post.id)}
        <PostCard style={css.raw({ width: { base: '200px', sm: '218px' } })} $post={post} showStats={false} />
      {/each}

      <Icon
        slot="right-icon"
        style={css.raw({ 'color': 'gray.0', '& *': { strokeWidth: '[2]' } })}
        icon={IconChevronRight}
        size={20}
      />
    </HorizontalScroll>
  </div>

  {#if $query.featureFlags.includes('SHOW_AD')}
    <AdSense style={css.raw({ width: 'full', height: '150px' })} slotId="3977220446" />
  {/if}

  <div class={css({ paddingTop: { base: '32px', sm: '40px' }, paddingBottom: { base: '40px', sm: '60px' } })}>
    <div class={flex({ align: 'center', justify: 'space-between', marginBottom: '14px' })}>
      <h2 class={css({ fontSize: '21px', fontWeight: 'bold' })}>
        {$query.me ? `${$query.me.profile.name}님을 위한 추천` : '독자님을 위한 추천'}
      </h2>
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
            sm: { _after: { content: '""', display: 'block', height: '1px', backgroundColor: 'gray.50' } },
          })}
        >
          <Post
            style={css.raw(index === 0 && { paddingTop: '0' }, index === 1 && { sm: { paddingTop: '0' } })}
            $post={post}
            {$query}
            showSpace
            showStats={false}
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
              _after: { content: '""', display: 'block', height: '1px', backgroundColor: 'gray.50' },
            },
          )}
        >
          <Post $post={post} {$query} showSpace showStats={false} />
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
        color: 'gray.0',
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
        smDown: { marginX: '-20px', paddingX: '20px' },
      })}
      role="tablist"
    >
      {#each $query.featuredTagFeed as feed (feed.__typename === 'FeaturedTag' ? feed.tag.id : feed.categoryId)}
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
          aria-selected={(feed.__typename === 'FeaturedTag' ? feed.tag.id : feed.categoryId) === activeFeaturedTagId}
          role="tab"
          type="button"
          on:click={() => (activeFeaturedTagId = feed.__typename === 'FeaturedTag' ? feed.tag.id : feed.categoryId)}
        >
          #{feed.__typename === 'FeaturedTag' ? feed.tag.name : categoryFilter[feed.categoryId]}
        </button>
      {/each}
    </div>

    <div class={grid({ columns: { base: 2, sm: 5 }, columnGap: '14px', rowGap: '36px' })}>
      {#each activeFeaturedTagFeed.posts.slice(0, 6) as post (post.id)}
        <PostCard $post={post} showStats={false} showTags theme="dark" />
      {/each}
      {#each activeFeaturedTagFeed.posts.slice(6, 10) as post (post.id)}
        <PostCard style={css.raw({ hideBelow: 'sm' })} $post={post} showStats={false} showTags theme="dark" />
      {/each}
    </div>
  </div>
</div>

<div class={css({ marginX: 'auto', paddingX: '20px', width: 'full', maxWidth: '1280px' })}>
  {#if $query.featureFlags.includes('SHOW_AD')}
    <AdSense
      style={css.raw({ marginTop: { base: '40px', sm: '60px' }, width: 'full', height: '150px' })}
      slotId="5096814705"
    />
  {/if}

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
                objectFit: 'cover',
              })}
              $image={collection.thumbnail}
              placeholder
              size={64}
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
                  size={24}
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
                objectFit: 'cover',
              })}
              $image={collection.thumbnail}
              placeholder
              size={96}
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
                  size={24}
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
