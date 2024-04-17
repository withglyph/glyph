import { Extension } from '@tiptap/core';
import { redo, undo, ySyncPlugin, yUndoPlugin, yUndoPluginKey } from 'y-prosemirror';
import * as Y from 'yjs';
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

    return [ySyncPlugin(fragment), yUndoPluginInstance];
  },

  addKeyboardShortcuts() {
    return {
      'Mod-z': () => this.editor.commands.undo(),
      'Mod-y': () => this.editor.commands.redo(),
      'Shift-Mod-z': () => this.editor.commands.redo(),
    };
  },
});
