<script lang="ts">
  import Logo from '$assets/branding/logo.svg?component';
  import { fragment, graphql } from '$houdini';
  import { Avatar, Button } from '$lib/components';
  import type { SpaceNewPostPage_Header_query } from '$houdini';

  let _query: SpaceNewPostPage_Header_query;
  export { _query as $query };

  $: query = fragment(
    _query,
    graphql(`
      fragment SpaceNewPostPage_Header_query on Query
      @arguments(slug: { type: "String!" }) {
        me {
          ...Avatar_profile
        }

        space(slug: $slug) {
          name
        }
      }
    `)
  );
</script>

<div class="sticky top-0 z-50 bg-white py-4">
  <div class="mx-auto w-4xl flex items-center gap-4">
    <a href="/">
      <Logo class="square-8 rounded" />
    </a>
    <div class="text-sm text-gray-500">
      {$query.space.name}에 새 포스트 작성중...
    </div>
    <div class="grow" />
    <Button>게시하기</Button>
    <Avatar class="square-8" $profile={$query.me} />
  </div>
</div>
