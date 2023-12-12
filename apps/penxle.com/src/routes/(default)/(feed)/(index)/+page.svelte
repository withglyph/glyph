<script lang="ts">
  import * as R from 'radash';
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

<div class="flex gap-4 <sm:(overflow-x-scroll px-4 mt-6)">
  {#each R.unique($query.recommendFeed, (post) => post.space.id).slice(0, 5) as post (post.id)}
    <a
      class="border border-secondary bg-cardprimary flex flex-col items-center rounded-xl py-2 px-2.5 w-full max-w-33.75 h-auto transition hover:(border-tertiary shadow-[0_4px_16px_0_rgba(0,0,0,0.25)]) sm:truncate"
      href={`/${post.space.slug}`}
    >
      <Image class="<sm:square-29 sm:square-full aspect-1/1 rounded-xl mb-2" $image={post.space.icon} />
      <p class="w-full body-16-b truncate">{post.space.name}</p>
    </a>
  {/each}
</div>

<h1 class="title-20-b w-fit border-b-10 leading-3 border-brand-50 my-8 <sm:mx-4">둘러보기</h1>

<div class="grow gap-4 mb-4 sm:columns-2">
  {#each $query.recommendFeed as post (post.id)}
    <Feed class="mb-4 inline-block break-inside-avoid col-w-50%" $post={post} />
  {/each}
</div>
