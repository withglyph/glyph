<script lang="ts">
  import dayjs from 'dayjs';
  import { fromUint8Array, toUint8Array } from 'js-base64';
  import { nanoid } from 'nanoid';
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { IndexeddbPersistence } from 'y-indexeddb';
  import * as YAwareness from 'y-protocols/awareness';
  import * as Y from 'yjs';
  import { browser } from '$app/environment';
  import { fragment, graphql } from '$glitch';
  import { isWebView } from '$lib/flutter';
  import AppEditor from './AppEditor.svelte';
  import { NETWORK, setEditorContext } from './context';
  import WebEditor from './WebEditor.svelte';
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

        ...EditorPage_AppEditor_query
        ...EditorPage_WebEditor_query
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

        ...EditorPage_AppEditor_post
        ...EditorPage_WebEditor_post
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
    if (origin !== NETWORK && $state.connectionState === 'synchronized') {
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
      if (!browser || origin === NETWORK || $state.connectionState !== 'synchronized') {
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
  });

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
    const persistence = new IndexeddbPersistence(`withglyph:editor:${$post.id}`, yDoc);
    persistence.on('synced', () => {
      forceSynchronize();
    });

    const unsubscribe = postSynchronization.subscribe({ postId: $post.id });
    const interval = setInterval(() => updateConnectionState(), 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
      YAwareness.removeAwarenessStates(yAwareness, [yDoc.clientID], NETWORK);
      yDoc.destroy();
    };
  });
</script>

{#if $isWebView}
  <AppEditor {$post} {$query} />
{:else}
  <WebEditor {$post} {$query} />
{/if}
