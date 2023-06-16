<script lang="ts">
  import { Helmet } from '$lib/components';
  import { graphql, useQuery } from '$lib/houdini';
  import { warnOnUnload } from '$lib/svelte/lifecycle';
  import Header from './Header.svelte';
  import Uploader from './Uploader.svelte';

  warnOnUnload();

  $: query = useQuery(
    graphql(`
      query SpaceNewArtworkPage_Query($slug: String!) @load {
        ...SpaceNewArtworkPage_Header_query @with(slug: $slug)
      }
    `)
  );
</script>

<Helmet title="새 그림 업로드하기" />

<main class="flex grow flex-col">
  <Header {$query} />
  <Uploader />
</main>
