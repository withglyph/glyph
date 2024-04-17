<script lang="ts">
  import dayjs from 'dayjs';
  import { fromUint8Array, toUint8Array } from 'js-base64';
  import { Loro, VersionVector } from 'loro-crdt';
  import { nanoid } from 'nanoid';
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { fragment, graphql } from '$glitch';
  import { Helmet } from '$lib/components';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import Content from './Content.svelte';
  import { setEditorContext } from './context';
  import Header from './Header.svelte';
  import { createLoroStore } from './utils';
  import type { EditorPage_Editor_post, EditorPage_Editor_query } from '$glitch';
  import type { Document, EditorState } from './context';

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
      }
    `),
  );

  const synchronizePost = graphql(`
    mutation EditorPage_Editor_SynchronizePost_Mutation($input: SynchronizePostInput!) {
      synchronizePost(input: $input) {
        postId
        kind
        data
      }
    }
  `);

  const postSynchronization = graphql(`
    subscription EditorPage_Editor_PostSynchronization_Subscription($postId: ID!) {
      postSynchronization(postId: $postId) {
        postId
        kind
        data
      }
    }
  `);

  const loroDocument = new Loro<Document>();
  loroDocument.setRecordTimestamp(true);

  let lastExportedVersionVector: VersionVector | undefined = undefined;
  let lastPingMessageReceivedAt: dayjs.Dayjs | null = null;

  postSynchronization.on('data', ({ postSynchronization }) => {
    if (postSynchronization.postId !== $post.id) {
      return;
    }

    if (postSynchronization.kind === 'PING') {
      lastPingMessageReceivedAt = dayjs();
    } else if (postSynchronization.kind === 'SYNCHRONIZE_3' && postSynchronization.data === $state.clientId) {
      $state.connectionState = 'synchronized';
    } else if (postSynchronization.kind === 'UPDATE') {
      loroDocument.import(toUint8Array(postSynchronization.data));
    }
  });

  const state = writable<EditorState>({
    clientId: nanoid(),
    document: loroDocument,
    connectionState: 'connecting',
  });

  const forceSynchronize = async () => {
    $state.connectionState = 'synchronizing';

    const clientVersionVector = loroDocument.version();

    const results = await synchronizePost({
      postId: $post.id,
      clientId: $state.clientId,
      kind: 'SYNCHRONIZE_1',
      data: fromUint8Array(clientVersionVector.encode()),
    });

    for (const { kind, data } of results) {
      if (kind === 'SYNCHRONIZE_1') {
        const serverVersionVector = VersionVector.decode(toUint8Array(data));
        const serverMissingOps = loroDocument.exportFrom(serverVersionVector);

        await synchronizePost({
          postId: $post.id,
          clientId: $state.clientId,
          kind: 'SYNCHRONIZE_2',
          data: fromUint8Array(serverMissingOps),
        });
      } else if (kind === 'SYNCHRONIZE_2') {
        const clientMissingOps = toUint8Array(data);
        loroDocument.import(clientMissingOps);
      }
    }
  };

  setEditorContext({
    state,
    forceSynchronize,
  });

  const title = createLoroStore($state, 'title');

  let vvHeight: number | undefined;

  const handleVisualViewportChange = () => {
    if (window.visualViewport) {
      vvHeight = window.visualViewport.height + window.visualViewport.offsetTop;
    }
  };

  const updateConnectionState = async () => {
    if (!lastPingMessageReceivedAt) {
      return;
    }

    const connected = dayjs().diff(lastPingMessageReceivedAt, 'second') < 5;
    if ($state.connectionState === 'disconnected' && connected) {
      await forceSynchronize();
    } else if (!connected) {
      $state.connectionState = 'disconnected';
    }
  };

  onMount(() => {
    // const persistence = new IndexeddbPersistence(`withglyph:editor:${$post.id}`, loroDocument);
    // persistence.on('synced', () => {
    //   forceSynchronize();
    // });

    forceSynchronize();

    const subscriptionId = loroDocument.subscribe((event) => {
      if (event.by !== 'local') {
        return;
      }

      const update = loroDocument.exportFrom(lastExportedVersionVector);
      lastExportedVersionVector = loroDocument.version();

      synchronizePost({
        postId: $post.id,
        clientId: $state.clientId,
        kind: 'UPDATE',
        data: fromUint8Array(update),
      });
    });

    const unsubscribe = postSynchronization.subscribe({ postId: $post.id });
    const interval = setInterval(() => updateConnectionState(), 1000);

    handleVisualViewportChange();
    window.visualViewport?.addEventListener('resize', handleVisualViewportChange);
    window.visualViewport?.addEventListener('scroll', handleVisualViewportChange);

    return () => {
      // persistence.destroy();
      loroDocument.unsubscribe(subscriptionId);
      unsubscribe();
      clearInterval(interval);

      window.visualViewport?.removeEventListener('resize', handleVisualViewportChange);
      window.visualViewport?.removeEventListener('scroll', handleVisualViewportChange);
    };
  });
</script>

<Helmet description="포스트 작성하기" title={`${$title ?? '(제목 없음)'} 작성`} />

<div
  class={css({ position: 'relative', flexGrow: '1', isolation: 'isolate', userSelect: 'none', touchAction: 'none' })}
>
  <div style:height={vvHeight ? `${vvHeight}px` : '100dvh'} class={flex({ direction: 'column' })}>
    <Header {$post} {$query} />

    <div class={flex({ direction: 'column', grow: '1', marginTop: '112px', overflow: 'auto' })}>
      <Content />
    </div>
  </div>
</div>
