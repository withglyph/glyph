<script lang="ts">
  import dayjs from 'dayjs';
  import { toUint8Array } from 'js-base64';
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import { yDocToProsemirrorJSON } from 'y-prosemirror';
  import * as Y from 'yjs';
  import IconClockPlay from '~icons/tabler/clock-play';
  import { fragment, graphql } from '$glitch';
  import { Icon } from '$lib/components';
  import { RingSpinner } from '$lib/components/spinners';
  import { createFloatingActions, portal } from '$lib/svelte/actions';
  import { TiptapEditor } from '$lib/tiptap/components';
  import { clamp } from '$lib/utils';
  import { css } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';
  import { getEditorContext, SNAPSHOT } from './context';
  import type { Editor } from '@tiptap/core';
  import type { PointerEventHandler } from 'svelte/elements';
  import type { EditorPage_TimeTravel_post } from '$glitch';

  let _post: EditorPage_TimeTravel_post;
  export { _post as $post };

  $: post = fragment(
    _post,
    graphql(`
      fragment EditorPage_TimeTravel_post on Post {
        id
        permalink
      }
    `),
  );

  $: query = graphql(`
    query EditorPage_TimeTravel_Query($permalink: String!) @_manual {
      post(permalink: $permalink) {
        id

        contentState {
          id
          update
        }

        contentSnapshots {
          id
          data
          createdAt
        }
      }
    }
  `);

  const { state, forceSynchronize } = getEditorContext();

  const { anchor, floating, arrow } = createFloatingActions({
    placement: 'top',
    offset: 8,
    arrow: true,
  });

  let value = 0.01;
  let document: Y.Doc;

  let title = '';
  let subtitle = '';

  let editor: Editor;

  $: max = $query?.post.contentSnapshots.length ? $query.post.contentSnapshots.length - 0.99 : 0.01;
  $: p = `${(value / max) * 100}%`;

  $: targetIdx = Math.round(value);
  $: update(targetIdx);

  $state.doTimeTravel = () => {
    if (!$query) {
      return;
    }

    const snapshot = Y.decodeSnapshotV2(toUint8Array($query.post.contentSnapshots[targetIdx].data));
    const snapshotDoc = Y.createDocFromSnapshot(document, snapshot);

    const currentStateVector = Y.encodeStateVector($state.document);
    const snapshotStateVector = Y.encodeStateVector(snapshotDoc);

    const snapshotMissingUpdate = Y.encodeStateAsUpdateV2($state.document, snapshotStateVector);

    const undoManager = new Y.UndoManager(
      [snapshotDoc.getText('title'), snapshotDoc.getText('subtitle'), snapshotDoc.getXmlFragment('content')],
      { trackedOrigins: new Set([SNAPSHOT]) },
    );
    Y.applyUpdateV2(snapshotDoc, snapshotMissingUpdate, SNAPSHOT);
    undoManager.undo();

    const revertUpdate = Y.encodeStateAsUpdateV2(snapshotDoc, currentStateVector);
    Y.applyUpdateV2($state.document, revertUpdate, SNAPSHOT);
  };

  const load = async () => {
    await forceSynchronize();
    const resp = await query.refetch({ permalink: $post.permalink });

    document = new Y.Doc({ gc: false });
    Y.applyUpdateV2(document, toUint8Array(resp.post.contentState.update));

    value = resp.post.contentSnapshots.length - 0.99;
    update(Math.round(value));
  };

  const update = (idx: number) => {
    if (!$query) {
      return;
    }

    const snapshot = Y.decodeSnapshotV2(toUint8Array($query.post.contentSnapshots[idx].data));
    const doc = Y.createDocFromSnapshot(document, snapshot);

    title = doc.getText('title').toString();
    subtitle = doc.getText('subtitle').toString();
    editor
      .chain()
      .setMeta('antifreeze', true)
      .setContent(yDocToProsemirrorJSON(doc, 'content'))
      .setTextSelection(0)
      .run();
  };

  const handler: PointerEventHandler<HTMLElement> = (e) => {
    if (!e.currentTarget.parentElement || !$query) {
      return;
    }

    const { left: parentLeft, width: parentWidth } = e.currentTarget.parentElement.getBoundingClientRect();
    const { clientX: pointerLeft } = e;
    value = clamp(((pointerLeft - parentLeft) / parentWidth) * max, 0, max);
  };

  onMount(() => {
    load();
  });
</script>

<main class={flex({ direction: 'column', grow: '1', backgroundColor: 'gray.800' })}>
  <div
    class={flex({
      direction: 'column',
      grow: '1',
      marginX: 'auto',
      paddingY: '20px',
      width: 'full',
      maxWidth: '940px',
      backgroundColor: 'gray.0',
      sm: { paddingTop: '34px' },
    })}
  >
    <div
      class={css({
        borderBottomWidth: '1px',
        borderBottomColor: 'gray.200',
        marginX: { base: '20px', sm: '40px' },
        marginBottom: '20px',
        paddingBottom: '10px',
      })}
    >
      <input
        class={css({ width: 'full', fontSize: { base: '22px', sm: '28px' }, fontWeight: 'bold' })}
        maxlength="100"
        placeholder="제목을 입력하세요"
        readonly
        type="text"
        value={title}
      />

      <input
        class={css({ marginTop: '4px', width: 'full', fontSize: '16px', fontWeight: 'medium' })}
        maxlength="100"
        placeholder="부제목을 입력하세요"
        readonly
        type="text"
        value={subtitle}
      />
    </div>

    <div class={flex({ grow: '1', paddingX: { base: '20px', sm: '40px' }, width: 'full' })}>
      <TiptapEditor style={css.raw({ flexGrow: '1', paddingBottom: '100px', maxWidth: 'full' })} frozen bind:editor />
    </div>
  </div>
</main>

<div
  class={center({
    position: 'fixed',
    left: '1/2',
    bottom: '57px',
    gap: '6px',
    borderRadius: 'full',
    paddingY: '12px',
    paddingRight: '20px',
    paddingLeft: '16px',
    width: '602px',
    backgroundColor: 'gray.800',
    zIndex: '30',
    translate: 'auto',
    translateX: '-1/2',
    boxShadow: '[0 2px 7px 0 {colors.gray.900/10}]',
  })}
  use:portal
  in:fly={{ y: 50 }}
>
  <Icon style={css.raw({ color: 'gray.400' })} icon={IconClockPlay} size={20} />

  {#if $query}
    <div class={flex({ position: 'relative', align: 'center', grow: '1', marginX: '8px', height: '16px' })}>
      <div
        class={css({
          borderRadius: 'full',
          width: 'full',
          height: '6px',
          backgroundColor: 'gray.600',
          overflow: 'hidden',
        })}
        on:pointerdown={handler}
      >
        <div style:width={p} class={css({ height: 'full', backgroundColor: 'brand.400' })} />
      </div>
      <div class={css({ position: 'absolute', width: 'full', height: '8px', pointerEvents: 'none' })}>
        <button
          style:left={p}
          class={css({
            position: 'absolute',
            top: '1/2',
            borderRadius: 'full',
            size: '16px',
            backgroundColor: 'brand.50',
            translate: 'auto',
            translateX: '-1/2',
            translateY: '-1/2',
            pointerEvents: 'auto',
            touchAction: 'none',
          })}
          type="button"
          on:dragstart|preventDefault
          on:pointerdown={(e) => e.currentTarget.setPointerCapture(e.pointerId)}
          on:pointermove|preventDefault={(e) => {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) {
              handler(e);
            }
          }}
          use:anchor
        />
      </div>
    </div>

    <div
      class={css({
        paddingX: '14px',
        paddingY: '10px',
        backgroundColor: 'gray.600',
        zIndex: '40',
      })}
      role="tooltip"
      use:floating
    >
      <div
        class={css({
          position: 'relative',
          fontSize: '13px',
          fontFeatureSettings: '"tnum" 1',
          color: 'gray.0',
          zIndex: '2',
        })}
      >
        {dayjs($query.post.contentSnapshots[targetIdx].createdAt).format('YYYY. MM. DD HH:mm:ss')}
      </div>

      <div
        class={css({
          size: '8px',
          backgroundColor: 'gray.600',
          zIndex: '1',
        })}
        use:arrow
      />
    </div>
  {:else}
    <div class={flex({ justify: 'center', align: 'center', grow: '1', height: '16px' })}>
      <RingSpinner style={css.raw({ size: '16px', color: 'gray.50' })} />
    </div>
  {/if}
</div>
