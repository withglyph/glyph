<script lang="ts">
  import { graphql } from '$glitch';
  import { Button } from '$lib/components';
  import { PostManageTable } from '$lib/components/pages';

  $: query = graphql(`
    query SpaceSettingPostsPage_Query($slug: String!) {
      space(slug: $slug) {
        id

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

<div class="flex justify-between gap-2 flex-wrap flex-items-end">
  <div class="flex gap-2 <sm:hidden">
    <Button class="flex-1" href="/me/posts" size="md" type="link">내 포스트 관리하기</Button>
  </div>
</div>

{#if $query.space && $query.space.meAsMember}
  <PostManageTable $posts={$query.space.posts} $spaceMember={$query.space.meAsMember} type="space" />
{/if}
