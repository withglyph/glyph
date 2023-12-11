<script lang="ts">
  import { onMount } from 'svelte';
  import { graphql } from '$glitch';
  import { PostManageTable } from '$lib/components/pages/posts';
  import { pageSubTitle } from '$lib/stores';

  onMount(async () => {
    pageSubTitle.set('포스트 관리');
  });

  $: query = graphql(`
    query MeSettingPostsPage_Query {
      me @_required {
        id

        posts {
          id

          ...PostManageTable_Post_query
        }
      }
    }
  `);
</script>

{#if $query.me}
  <PostManageTable $posts={$query.me.posts} type="me" />
{/if}
