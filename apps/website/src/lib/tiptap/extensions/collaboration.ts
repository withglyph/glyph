import { Extension } from '@tiptap/core';
import { redo, undo, yCursorPlugin, ySyncPlugin, yUndoPlugin, yUndoPluginKey } from 'y-prosemirror';
import * as YAwareness from 'y-protocols/awareness';
import * as Y from 'yjs';
import { css } from '$styled-system/css';
import type { EditorView } from '@tiptap/pm/view';

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Commands<ReturnType> {
    collaboration: {
      undo: () => ReturnType;
      redo: () => ReturnType;
    };
  }
}

type CollaborationOptions = {
  document: Y.Doc;
  awareness?: YAwareness.Awareness;
};

export const Collaboration = Extension.create<CollaborationOptions>({
  name: 'collaboration',
  priority: 1000,

  addCommands() {
    return {
      undo:
        () =>
        ({ state, tr, dispatch }) => {
          tr.setMeta('preventDispatch', true);

          const undoManager = yUndoPluginKey.getState(state).undoManager as Y.UndoManager;
          if (undoManager.undoStack.length === 0) {
            return false;
          }

          if (!dispatch) {
            return true;
          }

          return undo(state);
        },
      redo:
        () =>
        ({ state, tr, dispatch }) => {
          tr.setMeta('preventDispatch', true);

          const undoManager = yUndoPluginKey.getState(state).undoManager as Y.UndoManager;
          if (undoManager.redoStack.length === 0) {
            return false;
          }

          if (!dispatch) {
            return true;
          }

          return redo(state);
        },
    };
  },

  addProseMirrorPlugins() {
    const fragment = this.options.document.getXmlFragment('content');

    const yUndoPluginInstance = yUndoPlugin();
    const originalUndoPluginView = yUndoPluginInstance.spec.view;

    yUndoPluginInstance.spec.view = (view: EditorView) => {
      const { undoManager } = yUndoPluginKey.getState(view.state);

      if (undoManager.restore) {
        undoManager.restore();
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        undoManager.restore = () => {};
      }

      const viewRet = originalUndoPluginView ? originalUndoPluginView(view) : undefined;

      return {
        destroy: () => {
          const hasUndoManSelf = undoManager.trackedOrigins.has(undoManager);
          const observers = undoManager._observers;

          undoManager.restore = () => {
            if (hasUndoManSelf) {
              undoManager.trackedOrigins.add(undoManager);
            }

            undoManager.doc.on('afterTransaction', undoManager.afterTransactionHandler);
            undoManager._observers = observers;
          };

          if (viewRet?.destroy) {
            viewRet.destroy();
          }
        },
      };
    };

    type User = { name: string; color: string };

    const cursorBuilder = (user: User) => {
      const cursor = document.createElement('span');
      cursor.className = css({
        'position': 'relative',
        'marginX': '-1px',
        'borderXWidth': '1px',
        'borderColor': 'var(--user-color)',
        'pointerEvents': 'none',
        '& + .ProseMirror-separator': {
          display: 'none',
        },
        '& + .ProseMirror-separator + .ProseMirror-trailingBreak': {
          display: 'none',
        },
        '_before': {
          content: 'var(--user-name)',
          position: 'absolute',
          top: '0',
          left: '-1px',
          paddingX: '4px',
          paddingY: '2px',
          width: 'max',
          fontFamily: 'ui',
          fontSize: '13px',
          lineHeight: 'none',
          textIndent: '0',
          color: 'gray.50',
          backgroundColor: 'var(--user-color)',
          translate: 'auto',
          translateY: '-full',
        },
      });
      cursor.style.setProperty('--user-name', `"${user.name}"`);
      cursor.style.setProperty('--user-color', user.color);
      return cursor;
    };

    const selectionBuilder = (user: User) => {
      return {
        style: `--user-color: color-mix(in srgb, ${user.color} 50%, transparent);`,
        class: css({ backgroundColor: 'var(--user-color)' }),
      };
    };

    return [
      ySyncPlugin(fragment),
      yUndoPluginInstance,
      ...(this.options.awareness ? [yCursorPlugin(this.options.awareness, { cursorBuilder, selectionBuilder })] : []),
    ];
  },

  addKeyboardShortcuts() {
    return {
      'Mod-z': () => this.editor.commands.undo(),
      'Mod-y': () => this.editor.commands.redo(),
      'Shift-Mod-z': () => this.editor.commands.redo(),
    };
  },
});
