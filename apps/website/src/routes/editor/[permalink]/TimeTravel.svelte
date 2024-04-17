<script lang="ts">
  import { toUint8Array } from 'js-base64';
  import { ySyncPluginKey } from 'y-prosemirror';
  import * as Y from 'yjs';
  import { fragment, graphql } from '$glitch';
  import { Slider } from '$lib/components/forms';
  import { css } from '$styled-system/css';
  import { getEditorContext } from './context';
  import type { EditorPage_TimeTravel_post } from '$glitch';

  let _post: EditorPage_TimeTravel_post;
  export { _post as $post };
  export let open = false;

  $: post = fragment(
    _post,
    graphql(`
      fragment EditorPage_TimeTravel_post on Post {
        id

        contentUpdates {
          id
          data
          createdAt
        }
      }
    `),
  );

  const { state } = getEditorContext();

  let value = 0;
  // const document = new Y.Doc({ gc: false });

  $: targetIdx = Math.round(value);

  $: {
    const updates = $post.contentUpdates.slice(0, targetIdx).map((update) => toUint8Array(update.data));
    const update = Y.mergeUpdatesV2(updates);

    const doc = new Y.Doc({ gc: false });
    Y.applyUpdateV2(doc, update);

    const snapshot = Y.snapshot(doc);
    // Y.createDocFromSnapshot(doc, snapshot, document);

    //   editorview.dispatch(editorview.state.tr.setMeta(ySyncPluginKey, { snapshot: Y.decodeSnapshot(version.snapshot), prevSnapshot: prevSnapshot == null ? Y.emptySnapshot : Y.decodeSnapshot(prevSnapshot) }))
    // updateLiveTrackingState(editorview)

    if ($state.editor) {
      const { tr } = $state.editor.state;
      tr.setMeta(ySyncPluginKey, { snapshot, prevSnapshot: Y.emptySnapshot });
      $state.editor.view.dispatch(tr);
    }

    // content = doc;

    // content = yDocToProsemirrorJSON(doc, 'content');

    // const ttState = Y.encodeStateAsUpdateV2(doc);
    // const ttState = Y.encodeStateAsUpdateV2()
    // const stateVector = Y.encodeStateVector(doc);
    // const u = Y.encodeStateAsUpdateV2($state.document, stateVector);

    // console.log(Y.snapshot(doc));
    // const n = Y.createDocFromSnapshot(doc, Y.snapshot(doc), $state.document);
    // console.log(Y.encodeStateAsUpdateV2(n));
    // const diff = Y.encodeStateAsUpdateV2($state.document, stateVector);

    // Y.applyUpdateV2($state.document, diff);
  }
</script>

{#if open}
  <div
    class={css({
      position: 'fixed',
      inset: '0',
      zIndex: '50',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    })}
  >
    <Slider style={css.raw({ width: '500px' })} max={$post.contentUpdates.length - 1} min={0} bind:value />

    <!-- <TiptapEditor style={css.raw({ width: '500px', height: '500px' })} {document} /> -->
  </div>
{/if}
