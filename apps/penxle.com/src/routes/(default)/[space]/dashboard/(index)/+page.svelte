<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { onMount } from 'svelte';
  import { graphql } from '$glitch';
  import { pageSubTitle } from '$lib/stores';

  $: query = graphql(`
    query SpaceDashboardIndexPage_Query($slug: String!) {
      space(slug: $slug) {
        id
        name
      }
    }
  `);

  onMount(async () => {
    pageSubTitle.set('대시보드');
  });
</script>

<Helmet title={`대시보드 | ${$query.space.name}`} />

dashboard
