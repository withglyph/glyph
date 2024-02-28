<script lang="ts">
  import { onMount } from 'svelte';
  import { graphql } from '$glitch';
  import { Helmet } from '$lib/components';
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

<Helmet description={`${$query.space.name} 스페이스 대시보드`} title={`대시보드 | ${$query.space.name}`} />

dashboard
