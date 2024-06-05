<script lang="ts">
  import dayjs from 'dayjs';
  import { fromUint8Array, toUint8Array } from 'js-base64';
  import { nanoid } from 'nanoid';
  import { onMount } from 'svelte';
  import { readable, writable } from 'svelte/store';
  import * as YAwareness from 'y-protocols/awareness';
  import * as Y from 'yjs';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { fragment, graphql } from '$glitch';
  import { Helmet } from '$lib/components';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import Content from './Content.svelte';
  import { NETWORK, setEditorContext } from './context';
  import FileHandler from './FileHandler.svelte';
  import Header from './Header.svelte';
  import TimeTravel from './TimeTravel.svelte';
  import type { EditorPage_Editor_post, EditorPage_Editor_query } from '$glitch';
  import type { EditorState } from './context';

  export { _post as $post, _query as $query };
  let _query: EditorPage_Editor_query;
  let _post: EditorPage_Editor_post;

  $: query = fragment(
    _query,
    graphql(`
      fragment EditorPage_Editor_query on Query {
        me @_required {
          id

          profile {
            id
            name

            avatar {
              id
              color
            }
          }
        }

        ...EditorPage_Header_query
      }
    `),
  );

  $: post = fragment(
    _post,
    graphql(`
      fragment EditorPage_Editor_post on Post {
        id

        space {
          id

          meAsMember {
            id

            profile {
              id
              name

              avatar {
                id
                color
              }
            }
          }
        }

        ...EditorPage_Header_post
        ...EditorPage_TimeTravel_post
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

  const yDoc = new Y.Doc();
  const yAwareness = new YAwareness.Awareness(yDoc);

  let lastPingMessageReceivedAt: dayjs.Dayjs | null = null;

  postSynchronization.on('data', ({ postSynchronization }) => {
    if (postSynchronization.postId !== $post.id) {
      return;
    }

    // eslint-disable-next-line unicorn/prefer-switch
    if (postSynchronization.kind === 'PING') {
      lastPingMessageReceivedAt = dayjs();
    } else if (postSynchronization.kind === 'SYNCHRONIZE_3') {
      if (postSynchronization.data === $state.clientId) {
        $state.connectionState = 'synchronized';
      }

      synchronizePost({
        postId: $post.id,
        clientId: $state.clientId,
        kind: 'AWARENESS',
        data: fromUint8Array(YAwareness.encodeAwarenessUpdate(yAwareness, [yDoc.clientID])),
      });
    } else if (postSynchronization.kind === 'UPDATE') {
      Y.applyUpdateV2(yDoc, toUint8Array(postSynchronization.data), NETWORK);
    } else if (postSynchronization.kind === 'AWARENESS') {
      YAwareness.applyAwarenessUpdate(yAwareness, toUint8Array(postSynchronization.data), NETWORK);
    }
  });

  yDoc.on('updateV2', async (update, origin) => {
    if (origin !== NETWORK) {
      await synchronizePost({
        postId: $post.id,
        clientId: $state.clientId,
        kind: 'UPDATE',
        data: fromUint8Array(update),
      });
    }
  });

  yAwareness.on(
    'update',
    async (states: { added: number[]; updated: number[]; removed: number[] }, origin: unknown) => {
      if (!browser || origin === NETWORK) {
        return;
      }

      const update = YAwareness.encodeAwarenessUpdate(yAwareness, [
        ...states.added,
        ...states.updated,
        ...states.removed,
      ]);

      await synchronizePost({
        postId: $post.id,
        clientId: $state.clientId,
        kind: 'AWARENESS',
        data: fromUint8Array(update),
      });
    },
  );

  const state = writable<EditorState>({
    document: yDoc,
    awareness: yAwareness,

    clientId: nanoid(),
    connectionState: 'connecting',

    timeTravel: false,
  });

  const forceSynchronize = async () => {
    $state.connectionState = 'synchronizing';

    const clientStateVector = Y.encodeStateVector(yDoc);

    const results = await synchronizePost({
      postId: $post.id,
      clientId: $state.clientId,
      kind: 'SYNCHRONIZE_1',
      data: fromUint8Array(clientStateVector),
    });

    for (const { kind, data } of results) {
      if (kind === 'SYNCHRONIZE_1') {
        const serverStateVector = toUint8Array(data);
        const serverMissingUpdate = Y.encodeStateAsUpdateV2(yDoc, serverStateVector);

        await synchronizePost({
          postId: $post.id,
          clientId: $state.clientId,
          kind: 'SYNCHRONIZE_2',
          data: fromUint8Array(serverMissingUpdate),
        });
      } else if (kind === 'SYNCHRONIZE_2') {
        const clientMissingUpdate = toUint8Array(data);

        Y.applyUpdateV2(yDoc, clientMissingUpdate, NETWORK);
      }
    }
  };

  setEditorContext({
    state,
    forceSynchronize,
    isWebView: $page.url.searchParams.has('webview'),
  });

  const title = readable<string | null>(undefined, (set) => {
    const yText = yDoc.getText('title');
    const handler = () => {
      const value = yText.toString();
      set(value === '' ? null : value);
    };

    yText.observe(handler);
    return () => yText.unobserve(handler);
  });

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

  $: {
    const profile = $post.space?.meAsMember?.profile ?? $query.me.profile;
    yAwareness.setLocalStateField('user', {
      name: profile.name,
      color: profile.avatar.color,
    });
  }

  onMount(() => {
    forceSynchronize();

    const unsubscribe = postSynchronization.subscribe({ postId: $post.id });
    const interval = setInterval(() => updateConnectionState(), 1000);

    handleVisualViewportChange();
    window.visualViewport?.addEventListener('resize', handleVisualViewportChange);
    window.visualViewport?.addEventListener('scroll', handleVisualViewportChange);

    return () => {
      unsubscribe();
      clearInterval(interval);
      YAwareness.removeAwarenessStates(yAwareness, [yDoc.clientID], NETWORK);
      yDoc.destroy();

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

    <div
      class={flex({
        direction: 'column',
        grow: '1',
        marginTop: $state.timeTravel ? '62px' : { base: '103px', sm: '168px' },
        overflow: 'auto',
      })}
    >
      {#if $state.timeTravel}
        <TimeTravel {$post} />
      {:else}
        <Content />
      {/if}
    </div>
  </div>
</div>

<FileHandler />
