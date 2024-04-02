<script lang="ts">
  import IconChevronLeft from '~icons/tabler/chevron-left';
  import IconChevronRight from '~icons/tabler/chevron-right';
  import IconRefresh from '~icons/tabler/refresh';
  import { graphql } from '$glitch';
  import { Helmet, Icon, Tag } from '$lib/components';
  import { css } from '$styled-system/css';
  import { flex, grid } from '$styled-system/patterns';
  import Carousel from './Carousel.svelte';
  import HorizontalScroll from './HorizontalScroll.svelte';
  import Post from './Post.svelte';
  import PostCard from './PostCard.svelte';

  $: query = graphql(`
    query IndexPage_Query {
      me {
        id

        profile {
          id
          name
        }

        posts {
          id
          ...Feed_Post_post
          ...Feed_PostCard_post
        }
      }

      recommendFeed {
        id

        ...Feed_Post_post
        ...Feed_PostCard_post
      }

      recentlyUsedTags {
        id
        name
      }
    }
  `);

  const tags = [
    { id: '1', name: '태그 1' },
    { id: '2', name: '태그 2' },
    { id: '3', name: '태그 3' },
    { id: '4', name: '태그 4' },
    { id: '5', name: '태그 5' },
    { id: '6', name: '태그 6' },
    { id: '7', name: '태그 7' },
    { id: '8', name: '태그 8' },
    { id: '9', name: '태그 9' },
    { id: '10', name: '태그 10' },
    { id: '11', name: '태그 11' },
    { id: '12', name: '태그 12' },
    { id: '13', name: '태그 13' },
    { id: '14', name: '태그 14' },
    { id: '15', name: '태그 15' },
    { id: '16', name: '태그 16' },
    { id: '17', name: '태그 17' },
    { id: '18', name: '태그 18' },
    { id: '19', name: '태그 19' },
    { id: '20', name: '태그 20' },
  ];

  let checkedTags = tags[0];

  const collections = [
    '컬렉션 제목 1',
    '컬렉션 제목 2',
    '컬렉션 제목 3',
    '컬렉션 제목 4',
    '컬렉션 제목 5',
    '컬렉션 제목 6',
    '컬렉션 제목 7',
    '컬렉션 제목 8',
    '컬렉션 제목 9',
  ];
</script>

<svelte:head>
  <meta name="naver-site-verification" content="b127529850b2cea3fde71eaf9c43d5b6cbb76d42" />
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "펜슬",
      "url": "https://pencil.so"
    }
  </script>
</svelte:head>

<Helmet
  description="펜슬은 누구나 창작자가 될 수 있는, 개인 창작자들을 위한 자유롭고 즐거운 창작 사이트예요. 펜슬에 1, 2차 창작물을 올리고, 다른 사람들의 창작 활동을 둘러보세요."
  image={{
    src: 'https://glyph.pub/assets/opengraph/default-cover.png',
    size: 'large',
  }}
  title="누구나 창작자가 되다, 펜슬"
  titleSuffix=""
/>

<div class={css({ marginX: 'auto', paddingX: '20px', width: 'full', maxWidth: '1280px' })}>
  <Carousel />

  <HorizontalScroll
    style={css.raw({ gap: '8px', paddingY: '16px' })}
    buttonStyle={css.raw({ backgroundColor: '[#ffffff/75]' })}
    gradientStyle={css.raw({ gradientFrom: '[gray.900/0]', gradientTo: 'gray.900', height: '35px', width: '70px' })}
  >
    <Icon
      slot="left-icon"
      style={css.raw({ 'color': 'gray.800', '& *': { strokeWidth: '[2.5]' } })}
      icon={IconChevronLeft}
      size={20}
    />

    {#each tags as tag, index (tag.id)}
      <Tag
        style={css.raw(
          { minWidth: 'fit', paddingX: '24px', height: '35px' },
          index % 3 === 1 && { backgroundColor: 'gray.800' },
          index % 3 === 2 && { backgroundColor: 'gray.600' },
        )}
        href={`/tag/${tag.name}/post`}
      >
        #{tag.name}
      </Tag>
    {/each}

    <Icon
      slot="right-icon"
      style={css.raw({ 'color': 'gray.800', '& *': { strokeWidth: '[2.5]' } })}
      icon={IconChevronRight}
      size={20}
    />
  </HorizontalScroll>

  <div class={css({ paddingY: { base: '24px', sm: '36px' } })}>
    <h2 class={css({ marginBottom: '14px', fontSize: { base: '20px', sm: '24px' }, fontWeight: 'bold' })}>
      글리프 큐레이션
    </h2>

    <HorizontalScroll
      style={css.raw({ gap: { base: '12px', sm: '14px' } })}
      buttonStyle={css.raw({ backgroundColor: '[#000000/40]' })}
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
        style={css.raw({ 'color': 'gray.5', '& *': { strokeWidth: '[2.5]' } })}
        icon={IconChevronLeft}
        size={20}
      />

      {#if $query.me}
        {#each $query.me.posts as post (post.id)}
          <PostCard style={css.raw({ width: { base: '200px', sm: '218px' } })} $post={post} />
        {/each}
      {/if}

      <Icon
        slot="right-icon"
        style={css.raw({ 'color': 'gray.5', '& *': { strokeWidth: '[2.5]' } })}
        icon={IconChevronRight}
        size={20}
      />
    </HorizontalScroll>
  </div>

  <div class={css({ paddingTop: '36px', paddingBottom: '60px' })}>
    <div class={flex({ align: 'center', justify: 'space-between', marginBottom: '14px' })}>
      <h2 class={css({ fontSize: { base: '20px', sm: '24px' }, fontWeight: 'bold' })}>
        {$query.me?.profile.name}님을 위한 추천
      </h2>

      <button class={css({ color: 'gray.500' })} type="button">
        <Icon icon={IconRefresh} size={24} />
      </button>
    </div>

    <ul
      class={grid({
        display: 'grid',
        columns: { base: 1, sm: 2 },
        columnGap: '60px',
      })}
    >
      {#if $query.me}
        {#each $query.me.posts.slice(0, 3) as post (post.id)}
          <li
            class={css({
              sm: { _after: { content: '""', display: 'block', height: '1px', backgroundColor: 'gray.100' } },
            })}
          >
            <Post $post={post} />
          </li>
        {/each}
        {#each $query.me.posts.slice(3, 6) as post, index (post.id)}
          <li
            class={css(
              index === 0 && {
                _after: { content: '""', display: 'block', height: '1px', backgroundColor: 'gray.100' },
                hideBelow: 'sm',
              },
            )}
          >
            <Post $post={post} />
          </li>
        {/each}
      {/if}
    </ul>
  </div>
</div>

<div class={css({ paddingY: '60px', backgroundColor: 'gray.900' })}>
  <div class={css({ marginX: 'auto', paddingX: '20px', width: 'full', maxWidth: '1280px' })}>
    <h2
      class={css({ marginBottom: '16px', fontSize: { base: '20px', sm: '24px' }, fontWeight: 'bold', color: 'gray.5' })}
    >
      추천 해시태그
    </h2>

    <div
      class={flex({
        align: 'center',
        gap: '4px',
        marginBottom: { base: '20px', sm: '14px' },
        overflowX: 'auto',
        scrollbar: 'hidden',
      })}
    >
      {#each tags.slice(0, 5) as tag (tag.id)}
        <Tag
          style={css.raw({
            'backgroundColor': 'gray.800',
            'minWidth': 'fit',
            'color': 'gray.300',
            '&:has(:checked)': {
              borderWidth: '0',
              backgroundColor: 'gray.50',
              color: 'gray.900',
            },
          })}
          as="label"
          checked={checkedTags.id === tag.id}
          size="lg"
          on:change={(e) => {
            if (e.currentTarget.checked) checkedTags = tag;
          }}
        >
          #{tag.name}
        </Tag>
      {/each}
    </div>

    <div class={grid({ columns: { base: 2, sm: 5 }, columnGap: '14px', rowGap: '36px' })}>
      {#if $query.me}
        {#each $query.me?.posts.slice(0, 6) as post (post.id)}
          <PostCard $post={post} showTags theme="dark" />
        {/each}
        {#each $query.me.posts.slice(6, 10) as post (post.id)}
          <PostCard style={css.raw({ hideBelow: 'sm' })} $post={post} showTags theme="dark" />
        {/each}
      {/if}
    </div>
  </div>
</div>

<div class={css({ marginX: 'auto', paddingX: '20px', width: 'full', maxWidth: '1280px' })}>
  <div class={css({ paddingTop: '40px' })}>
    <h2 class={css({ marginBottom: '14px', fontSize: { base: '20px', sm: '24px' }, fontWeight: 'bold' })}>
      추천 컬렉션
    </h2>

    <ul class={css({ sm: { display: 'grid', gridTemplateColumns: '3', columnGap: '10px' } })}>
      {#each collections.slice(0, 6) as collection (collection)}
        <li
          class={flex({
            align: 'center',
            gap: '14px',
            paddingY: { base: '16px', sm: '24px' },
            _firstOfType: { paddingTop: '0' },
          })}
        >
          <div
            class={css({
              backgroundColor: 'gray.50',
              flex: 'none',
              width: { base: '48px', sm: '60px' },
              aspectRatio: '[4/5]',
            })}
          />

          <div class={css({ truncate: true })}>
            <h3
              class={css({
                marginBottom: '2px',
                fontSize: { base: '14px', sm: '16px' },
                fontWeight: 'semibold',
                truncate: true,
              })}
            >
              {collection}
            </h3>

            <div class={flex({ align: 'center', gap: '4px', truncate: true })}>
              <div
                class={css({
                  backgroundColor: 'gray.50',
                  flex: 'none',
                  borderWidth: '1px',
                  borderColor: 'gray.100',
                  size: '18px',
                })}
              />

              <span class={css({ fontSize: { base: '12px', sm: '13px' }, color: 'gray.600', truncate: true })}>
                스페이스명
              </span>
            </div>
          </div>
        </li>
      {/each}
      {#each collections.slice(6, 9) as collection (collection)}
        <li
          class={flex({
            align: 'center',
            gap: '14px',
            paddingY: { base: '16px', sm: '24px' },
            _firstOfType: { paddingTop: '0' },
            hideBelow: 'sm',
          })}
        >
          <div
            class={css({
              backgroundColor: 'gray.50',
              flex: 'none',
              width: { base: '48px', sm: '60px' },
              aspectRatio: '[4/5]',
            })}
          />

          <div class={css({ truncate: true })}>
            <h3
              class={css({
                marginBottom: '2px',
                fontSize: { base: '14px', sm: '16px' },
                fontWeight: 'semibold',
                truncate: true,
              })}
            >
              {collection}
            </h3>

            <div class={flex({ align: 'center', gap: '4px', truncate: true })}>
              <div
                class={css({
                  backgroundColor: 'gray.50',
                  flex: 'none',
                  borderWidth: '1px',
                  borderColor: 'gray.100',
                  size: '18px',
                })}
              />

              <span class={css({ fontSize: { base: '12px', sm: '13px' }, color: 'gray.600', truncate: true })}>
                스페이스명
              </span>
            </div>
          </div>
        </li>
      {/each}
    </ul>
  </div>
</div>
