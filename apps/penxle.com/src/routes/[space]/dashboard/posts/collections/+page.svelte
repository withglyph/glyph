<script lang="ts">
  import { onMount } from 'svelte';
  import { graphql } from '$glitch';
  import { SpaceDashboardLayout } from '$lib/layouts';
  import { pageSubTitle } from '$lib/stores';

  $: query = graphql(`
    query SpaceDashboardPostsCollectionsPage_Query($slug: String!) {
      ...SpaceDashboardLayout_query
    }
  `);

  onMount(async () => {
    pageSubTitle.set('포스트 관리');
  });
</script>

<SpaceDashboardLayout {$query}>포스트 관리 - 컬렉션 관리 탭</SpaceDashboardLayout>
