import { getContext, setContext } from 'svelte';
import * as YAwareness from 'y-protocols/awareness';
import type { Editor } from '@tiptap/core';
import type { Writable } from 'svelte/store';
import type * as Y from 'yjs';

export const NETWORK: unique symbol = Symbol('network');
export const SNAPSHOT: unique symbol = Symbol('snapshot');

export type EditorState = {
  editor?: Editor;

  document: Y.Doc;
  awareness: YAwareness.Awareness;

  clientId: string;
  connectionState: 'connecting' | 'synchronizing' | 'synchronized' | 'disconnected';

  timeTravel: boolean;
  doTimeTravel?: () => void;
};

type EditorContext = {
  state: Writable<EditorState>;
  forceSynchronize: () => Promise<void>;
};

const key: unique symbol = Symbol();

export const setEditorContext = (context: EditorContext) => {
  setContext(key, context);
};

export const getEditorContext = () => {
  return getContext<EditorContext>(key);
};
