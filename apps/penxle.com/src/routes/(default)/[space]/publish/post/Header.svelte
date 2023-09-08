<script lang="ts">
  import { fragment, graphql } from '$glitch';
  import { Avatar, Button } from '$lib/components';
  import { Logo } from '$lib/components/branding';
  import type {
    SpacePublishPostPage_Header_query,
    SpacePublishPostPage_Header_space,
  } from '$glitch';

  export let _query: SpacePublishPostPage_Header_query;
  export let _space: SpacePublishPostPage_Header_space;

  $: query = fragment(
    _query,
    graphql(`
      fragment SpacePublishPostPage_Header_query on Query {
        me {
          id

          profile {
            id
            ...Avatar_profile
          }
        }
      }
    `),
  );

  $: space = fragment(
    _space,
    graphql(`
      fragment SpacePublishPostPage_Header_space on Space {
        name
      }
    `),
  );
</script>

<div class="sticky top-0 z-50 bg-white py-4">
  <div class="mx-auto w-4xl flex items-center gap-4">
    <Logo class="square-8" />
    <div class="text-sm text-gray-50">
      {$space.name}에 새 글 작성중...
    </div>
    <div class="grow" />
    <Button>게시하기</Button>
    <Avatar class="square-8" _profile={$query.me.profile} />
  </div>
</div>
