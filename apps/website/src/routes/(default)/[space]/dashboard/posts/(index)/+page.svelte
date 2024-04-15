<script lang="ts">
  import { graphql } from '$glitch';
  import { Button, Helmet } from '$lib/components';
  import { PostManageTable } from '$lib/components/pages/posts';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';

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

<div class={flex({ justify: 'space-between', align: 'flex-end', gap: '8px', wrap: 'wrap' })}>
  <div class={flex({ gap: '8px' })}>
    <Button style={css.raw({ flex: '1' })} href="/me/posts" size="md" type="link">내 포스트 관리하기</Button>
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
