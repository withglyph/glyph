<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { graphql, useQuery } from '$lib/houdini';
  import { warnOnUnload } from '$lib/svelte/lifecycle';
  import Header from './Header.svelte';
  import Images from './Images.svelte';
  import type { Artwork } from './types';

  warnOnUnload();

  $: query = useQuery(
    graphql(`
      query SpacePublishArtworkPage_Query($slug: String!) @load {
        ...SpacePublishArtworkPage_Header_query @with(slug: $slug)
      }
    `),
  );

  let artworks: Artwork[] = [];
</script>

<Helmet title="새 그림 업로드하기" />

<main class="flex grow flex-col">
  <Header _query={$query} bind:artworks />
  <Images bind:artworks />
</main>
