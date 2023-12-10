<script lang="ts">
  import { graphql } from '$glitch';
  import { Feed, Image } from '$lib/components';

  $: query = graphql(`
    query FeedIndexPage_Query {
      recommendFeed {
        id
        ...Feed_post

        space {
          id
          slug
          name

          icon {
            id
            ...Image_image
          }
        }
      }
    }
  `);
</script>

<h1 class="title-24-b w-fit border-b-10 leading-3 border-brand-50 mb-8 mt-3">오늘의 펜슬</h1>

<div class="flex gap-4">
  {#each $query.recommendFeed.slice(0, 5) as post (post.id)}
    <a
      class="border border-secondary bg-cardprimary rounded-xl py-2 px-2.5 w-full max-w-33.75 truncate transition hover:(border-tertiary shadow-[0_4px_16px_0_rgba(0,0,0,0.25)])"
      href={`/${post.space.slug}`}
    >
      <Image class="rounded-xl mb-2 bg-black" $image={post.space.icon} />
      <p class="body-16-b truncate">{post.space.name}</p>
    </a>
  {/each}
</div>

<h1 class="title-24-b w-fit border-b-10 leading-3 border-brand-50 my-8">둘러보기</h1>

<div class="grow gap-4 columns-2 mb-8">
  {#each $query.recommendFeed as post (post.id)}
    <Feed class="mb-4 inline-block break-inside-avoid col-w-50%" $post={post} />
  {/each}
</div>
