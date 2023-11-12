import { Node } from '@tiptap/core';

type Level = 1 | 2;
type Attributes = { level: Level };

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Commands<ReturnType> {
    paragraph: {
      setParagraph: (level: Level) => ReturnType;
    };
  }
}

export const Paragraph = Node.create({
  name: 'paragraph',
  group: 'block',
  content: 'inline*',
  priority: 255,

  addAttributes() {
    return {
      level: {
        default: 1,
        parseHTML: (element) => element.dataset.level && Number.parseInt(element.dataset.level, 10),
        renderHTML: (attributes: Attributes) => ({ 'data-level': attributes.level.toString() }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'p' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['p', HTMLAttributes, 0];
  },

  addCommands() {
    return {
      setParagraph:
        (level) =>
        ({ commands, state }) => {
          const previousAttrs = state.selection.$head.parent.attrs;
          return commands.setNode(this.name, { ...previousAttrs, level });
        },
    };
  },
});
