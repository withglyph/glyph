import { Node } from '@tiptap/core';

type Level = 1 | 2 | 3;

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Commands<ReturnType> {
    heading: {
      setHeading: (level: Level) => ReturnType;
    };
  }
}

export const Heading = Node.create({
  name: 'heading',
  group: 'block',
  content: 'text*',
  defining: true,

  addAttributes() {
    return {
      level: {
        rendered: false,
      },
    };
  },

  parseHTML() {
    return [
      { tag: 'h1', attrs: { level: 1 } },
      { tag: 'h2', attrs: { level: 2 } },
      { tag: 'h3', attrs: { level: 3 } },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [`h${node.attrs.level}`, HTMLAttributes, 0];
  },

  addCommands() {
    return {
      setHeading:
        (level) =>
        ({ commands, state }) => {
          const previousAttrs = state.selection.$head.parent.attrs;
          return commands.setNode(this.name, { ...previousAttrs, level });
        },
    };
  },
});
