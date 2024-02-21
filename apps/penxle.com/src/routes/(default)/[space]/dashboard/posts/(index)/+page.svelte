<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { graphql } from '$glitch';
  import { Button } from '$lib/components';
  import { PostManageTable } from '$lib/components/pages/posts';

  $: query = graphql(`
    query SpaceSettingPostsPage_Query($slug: String!) {
      space(slug: $slug) {
        id
        name

        collections {
          ...PostManageTable_Collection
        }

        meAsMember {
          id
          ...PostManageTable_SpaceMember
        }

        posts {
          id
          ...PostManageTable_Post_query
        }
      }
    }
  `);
</script>

<Helmet description={`${$query.space.name} 스페이스 포스트 관리`} title={`포스트 관리 | ${$query.space.name}`} />

<div class="flex justify-between gap-2 flex-wrap flex-items-end">
  <div class="flex gap-2">
    <Button class="flex-1" href="/me/posts" size="md" type="link">내 포스트 관리하기</Button>
  </div>
</div>

{#if $query.space && $query.space.meAsMember}
  <PostManageTable
    $collections={$query.space.collections}
    $posts={$query.space.posts}
    $spaceMember={$query.space.meAsMember}
    type="space"
  />
{/if}
