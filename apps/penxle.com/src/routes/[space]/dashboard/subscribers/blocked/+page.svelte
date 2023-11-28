<script lang="ts">
  import { onMount } from 'svelte';
  import { graphql } from '$glitch';
  import { SpaceDashboardLayout } from '$lib/layouts';
  import { pageSubTitle } from '$lib/stores';

  $: query = graphql(`
    query SpaceDashboardSubscribersBlockedPage_Query($slug: String!) {
      ...SpaceDashboardLayout_query
    }
  `);

  onMount(async () => {
    pageSubTitle.set('독자 관리');
  });
</script>

<SpaceDashboardLayout {$query}>차단한 사용자</SpaceDashboardLayout>
