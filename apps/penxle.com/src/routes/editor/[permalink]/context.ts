import { getContext, setContext } from 'svelte';
import type { Editor, JSONContent } from '@tiptap/core';
import type { Writable } from 'svelte/store';
import type { PostRevisionKind } from '$glitch';

export type EditorStore = {
  title: string | undefined;
  subtitle: string | undefined;
  content: JSONContent | undefined;

  paragraphIndent: number;
  paragraphSpacing: number;
};

export type EditorState = {
  editor?: Editor;

  canRevise: boolean;
  isRevising: boolean;
  lastRevision?: {
    kind: PostRevisionKind;
    updatedAt: string;
  };
};

type EditorContext = {
  store: Writable<EditorStore>;
  state: Writable<EditorState>;
  forceSave: () => Promise<string>;
};

const key = Symbol();

export const setEditorContext = (context: EditorContext) => {
  setContext(key, context);
};

export const getEditorContext = () => {
  return getContext<EditorContext>(key);
};
