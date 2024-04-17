import { getContext, setContext } from 'svelte';
import type { Editor } from '@tiptap/core';
import type { Loro, LoroMap } from 'loro-crdt';
import type { Writable } from 'svelte/store';
import type { LoroProseMirrorNode } from '$lib/tiptap/extensions';

export type Document = {
  root: LoroMap<{
    title: string;
    subtitle: string;
    content: LoroProseMirrorNode;
  }>;
};

export type EditorState = {
  editor?: Editor;
  document: Loro<Document>;
  clientId: string;
  connectionState: 'connecting' | 'synchronizing' | 'synchronized' | 'disconnected';
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
