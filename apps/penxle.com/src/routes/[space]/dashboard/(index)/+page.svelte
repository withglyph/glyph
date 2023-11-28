<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { onMount } from 'svelte';
  import { graphql } from '$glitch';
  import { SpaceDashboardLayout } from '$lib/layouts';
  import { pageSubTitle } from '$lib/stores';

  $: query = graphql(`
    query SpaceDashboardIndexPage_Query($slug: String!) {
      ...SpaceDashboardLayout_query

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

<SpaceDashboardLayout {$query}>dashboard</SpaceDashboardLayout>
