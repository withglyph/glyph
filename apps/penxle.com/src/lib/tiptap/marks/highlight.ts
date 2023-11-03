import { Mark, mergeAttributes } from '@tiptap/core';

export type HighlightOptions = {
  multicolor: boolean;
  HTMLAttributes: Record<string, unknown>;
};

type Attributes = { id: string; type: 'self' } | { type: 'users' };

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Commands<ReturnType> {
    highlight: {
      /**
       * Set a highlight mark
       */
      setHighlight: () => ReturnType;
      /**
       * Toggle a highlight mark
       */
      toggleHighlight: () => ReturnType;
      /**
       * Unset a highlight mark
       */
      unsetHighlight: () => ReturnType;
    };
  }
}

export const Highlight = Mark.create<HighlightOptions>({
  name: 'highlight',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element) => element.dataset.id,
        renderHTML: (attributes: Attributes) => {
          if (!('id' in attributes)) return {};

          return { 'data-id': attributes.id.toString() };
        },
      },
      type: {
        default: 'self',
        parseHTML: (element) => element.dataset.type,
        renderHTML: (attributes: Attributes) => {
          if (!attributes.type) return {};

          return { 'data-type': attributes.type };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'mark',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['mark', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setHighlight:
        (attributes) =>
        ({ commands }) => {
          return commands.setMark(this.name, { ...initializeDefaultAttributes(), ...attributes });
        },
      toggleHighlight:
        (attributes) =>
        ({ commands }) => {
          return commands.setMark(this.name, { ...initializeDefaultAttributes(), ...attributes });
        },
      unsetHighlight:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-h': () => this.editor.commands.toggleHighlight(),
    };
  },
});

function initializeDefaultAttributes() {
  return {
    id: Date.now().toString(),
    type: 'self',
  };
}
