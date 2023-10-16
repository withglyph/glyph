<script lang="ts">
  import { Editor } from '@tiptap/core';
  import { goto } from '$app/navigation';
  import { fragment, graphql } from '$glitch';
  import { Avatar, Button } from '$lib/components';
  import { Logo } from '$lib/components/branding';
  import { toast } from '$lib/notification';
  import type { SpacePublishPostPage_Header_query, SpacePublishPostPage_Header_space } from '$glitch';

  let _query: SpacePublishPostPage_Header_query;
  let _space: SpacePublishPostPage_Header_space;
  export { _query as $query, _space as $space };

  export let title: string | undefined;
  export let editor: Editor | undefined;

  let draftPostId: string | undefined;

  $: query = fragment(
    _query,
    graphql(`
      fragment SpacePublishPostPage_Header_query on Query {
        me @_required {
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
        id
        slug
        name
      }
    `),
  );

  const revisePost = graphql(`
    mutation SpacePublishPostPage_RevisePost_Mutation($input: RevisePostInput!) {
      revisePost(input: $input) {
        id
        permalink
      }
    }
  `);
</script>

<div class="sticky top-0 z-50 bg-white py-4">
  <div class="mx-auto w-4xl flex items-center gap-4">
    <Logo class="square-8" />
    <div class="text-sm text-gray-50">
      {$space.name}에 새 글 작성중...
    </div>
    <div class="grow" />
    <Button
      color="secondary"
      size="md"
      on:click={async () => {
        if (!title) {
          alert('제목을 입력해주세요');
          return;
        }

        const { id } = await revisePost({
          title,
          spaceId: $space.id,
          postId: draftPostId,
          revisionKind: 'MANUAL_SAVE',
          content: editor?.getJSON(),
        });

        draftPostId = id;

        toast.success('임시저장 되었어요');
      }}
    >
      임시저장
    </Button>
    <Button
      size="md"
      on:click={async () => {
        if (!title) {
          alert('제목을 입력해주세요');
          return;
        }

        const { permalink } = await revisePost({
          title,
          spaceId: $space.id,
          postId: draftPostId,
          revisionKind: 'PUBLISHED',
          content: editor?.getJSON(),
        });

        await goto(`/${$space.slug}/${permalink}`);
      }}
    >
      게시하기
    </Button>
    <Avatar class="square-8" $profile={$query.me.profile} />
  </div>
</div>
