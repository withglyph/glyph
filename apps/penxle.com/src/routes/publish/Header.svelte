<script lang="ts">
  import { Editor } from '@tiptap/core';
  import { goto } from '$app/navigation';
  import { fragment, graphql } from '$glitch';
  import { Button } from '$lib/components';
  import { Logo } from '$lib/components/branding';
  import type { PostRevisionKind, PublishPage_Header_query } from '$glitch';

  let _query: PublishPage_Header_query;
  export { _query as $query };

  export let title: string;
  export let subtitle: string;
  export let editor: Editor;

  let postId: string | undefined;
  let spaceId: string;

  $: query = fragment(
    _query,
    graphql(`
      fragment PublishPage_Header_query on Query {
        me @_required {
          id

          spaces {
            id
            name
          }
        }
      }
    `),
  );

  $: canPublish = !!title;

  const revisePost = graphql(`
    mutation PublishPage_RevisePost_Mutation($input: RevisePostInput!) {
      revisePost(input: $input) {
        id
        permalink

        space {
          id
          slug
        }
      }
    }
  `);

  const revise = async (revisionKind: PostRevisionKind) => {
    const resp = await revisePost({
      postId,
      revisionKind,
      title,
      spaceId,
      subtitle,
      content: editor?.getJSON(),
    });

    postId = resp.id;

    return resp;
  };
</script>

<div class="sticky top-0 z-50 bg-white py-4">
  <div class="mx-auto w-4xl flex items-center gap-4">
    <Logo class="square-8" />
    <div class="grow" />
    <select bind:value={spaceId}>
      {#each $query.me.spaces as space (space.id)}
        <option value={space.id}>{space.name}</option>
      {/each}
    </select>
    <Button
      color="secondary"
      disabled={!canPublish}
      loading={$revisePost.inflight}
      size="md"
      on:click={() => revise('MANUAL_SAVE')}
    >
      임시저장
    </Button>
    <Button
      disabled={!canPublish}
      loading={$revisePost.inflight}
      size="md"
      on:click={async () => {
        const resp = await revise('PUBLISHED');
        await goto(`/${resp.space.slug}/${resp.permalink}`);
      }}
    >
      게시하기
    </Button>
  </div>
</div>
