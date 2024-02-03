<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import * as R from 'radash';
  import { writable } from 'svelte/store';
  import { browser, dev } from '$app/environment';
  import { beforeNavigate } from '$app/navigation';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import Content from './Content.svelte';
  import { setEditorContext } from './context';
  import Header from './Header.svelte';
  import type { EditorPage_Editor_post, EditorPage_Editor_query, PostRevisionKind } from '$glitch';
  import type { EditorState, EditorStore } from './context';

  export { _post as $post, _query as $query };
  let _query: EditorPage_Editor_query;
  let _post: EditorPage_Editor_post;

  $: query = fragment(
    _query,
    graphql(`
      fragment EditorPage_Editor_query on Query {
        ...EditorPage_Header_query
      }
    `),
  );

  $: post = fragment(
    _post,
    graphql(`
      fragment EditorPage_Editor_post on Post {
        id
        ...EditorPage_Header_post

        draftRevision @_required {
          id
          title
          subtitle
          editableContent
          paragraphIndent
          paragraphSpacing
        }
      }
    `),
  );

  const revisePost = graphql(`
    mutation EditorPage_Editor_RevisePost_Mutation($input: RevisePostInput!) {
      revisePost(input: $input) {
        id

        draftRevision @_required {
          id
          kind
          updatedAt
        }
      }
    }
  `);

  let warnUnload = false;

  const store = writable<EditorStore>();
  const state = writable<EditorState>({
    canRevise: true,
    isRevising: false,
  });

  $: if (!$store) {
    $store = {
      title: $post.draftRevision.title ?? undefined,
      subtitle: $post.draftRevision.subtitle ?? undefined,
      content: $post.draftRevision.editableContent,
      paragraphIndent: $post.draftRevision.paragraphIndent,
      paragraphSpacing: $post.draftRevision.paragraphSpacing,
    };
  }

  $: if (browser && $store) {
    warnUnload = true;
    autoSave();
  }

  $: $state.isRevising = $revisePost.inflight;

  const makeRevisePost = (revisionKind: PostRevisionKind) => {
    return async () => {
      const resp = await revisePost({
        revisionKind,
        postId: $post.id,
        title: $store.title,
        subtitle: $store.subtitle,
        content: $store.content,
        paragraphIndent: $store.paragraphIndent,
        paragraphSpacing: $store.paragraphSpacing,
      });

      mixpanel.track('post:revise', { postId: $post.id, revisionKind });

      $state.lastRevision = {
        kind: resp.draftRevision.kind,
        updatedAt: resp.draftRevision.updatedAt,
      };

      return resp.draftRevision.id;
    };
  };

  const autoSave = R.debounce({ delay: 1000 }, makeRevisePost('AUTO_SAVE'));

  beforeNavigate(({ cancel, willUnload }) => {
    if (dev || !warnUnload) {
      return;
    }

    if (willUnload) {
      cancel();
    } else if (!confirm('작성 중인 포스트가 있어요. 정말 나가시겠어요?')) {
      cancel();
    }
  });

  setEditorContext({
    store,
    state,
    forceSave: makeRevisePost('MANUAL_SAVE'),
  });
</script>

<Helmet title="포스트 수정하기" />

<Header {$post} {$query} />
<Content />
