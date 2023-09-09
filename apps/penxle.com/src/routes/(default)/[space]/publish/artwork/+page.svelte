<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { graphql } from '$glitch';
  import { warnOnUnload } from '$lib/svelte/lifecycle';
  import Header from './Header.svelte';
  import Images from './Images.svelte';
  import type { Artwork } from './types';

  warnOnUnload();

  $: query = graphql(`
    query SpacePublishArtworkPage_Query($slug: String!) {
      ...SpacePublishArtworkPage_Header_query

      space(slug: $slug) {
        id
        ...SpacePublishArtworkPage_Header_space
      }
    }
  `);

  let artworks: Artwork[] = [];
</script>

<Helmet title="새 그림 업로드하기" />

<main class="flex grow flex-col">
  <Header _query={$query} _space={$query.space} bind:artworks />
  <Images bind:artworks />
</main>
