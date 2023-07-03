<script lang="ts">
  import { fragment, graphql } from '$houdini';
  import { Avatar, Button } from '$lib/components';
  import { Logo } from '$lib/components/branding';
  import type { SpacePublishPostPage_Header_query } from '$houdini';

  export let _query: SpacePublishPostPage_Header_query;

  $: query = fragment(
    _query,
    graphql(`
      fragment SpacePublishPostPage_Header_query on Query
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
    <Logo class="square-8" />
    <div class="text-sm text-gray-500">
      {$query.space.name}에 새 글 작성중...
    </div>
    <div class="grow" />
    <Button>게시하기</Button>
    <Avatar class="square-8" _profile={$query.me} />
  </div>
</div>
