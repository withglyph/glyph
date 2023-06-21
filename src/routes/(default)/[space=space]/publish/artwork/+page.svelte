<script lang="ts">
  import { Helmet } from '$lib/components';
  import { graphql, useQuery } from '$lib/houdini';
  import { warnOnUnload } from '$lib/svelte/lifecycle';
  import Header from './Header.svelte';
  import Images from './Images.svelte';
  import Thumbnail from './Thumbnail.svelte';

  warnOnUnload();

  $: query = useQuery(
    graphql(`
      query SpacePublishArtworkPage_Query($slug: String!) @load {
        ...SpacePublishArtworkPage_Header_query @with(slug: $slug)
      }
    `)
  );

  let files: File[] = [];
</script>

<Helmet title="새 그림 업로드하기" />

<main class="flex grow flex-col">
  <Header {$query} bind:files />
  <Images bind:files />
  <div class="mx-auto">
    <Thumbnail />
  </div>
</main>
