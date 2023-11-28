<script lang="ts">
  import { onMount } from 'svelte';
  import { graphql } from '$glitch';
  import { SpaceDashboardLayout } from '$lib/layouts';
  import { pageSubTitle } from '$lib/stores';

  $: query = graphql(`
    query SpaceDashboardSubscribersPage_Query($slug: String!) {
      ...SpaceDashboardLayout_query
    }
  `);

  onMount(async () => {
    pageSubTitle.set('독자 관리');
  });
</script>

<SpaceDashboardLayout {$query}>스페이스 독자 관리</SpaceDashboardLayout>
