<script lang="ts">
  import { onMount } from 'svelte';
  import { graphql } from '$bifrost';
  import { Helmet } from '$lib/components';
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

<Helmet description="내 포스트를 관리하세요" title="내 포스트 관리" />

{#if $query.me}
  <PostManageTable $posts={$query.me.posts} type="me" />
{/if}
