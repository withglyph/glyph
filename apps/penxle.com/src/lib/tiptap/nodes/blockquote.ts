import { Node } from '@tiptap/core';
import { closest } from '$lib/utils';
import { css } from '$styled-system/css';
import { values } from '../values';

const blockquotes = values.blockquote.map(({ value }) => value);
type Blockquote = (typeof blockquotes)[number];

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Commands<ReturnType> {
    blockquote: {
      setBlockquote: (kind: Blockquote) => ReturnType;
      toggleBlockquote: (kind: Blockquote) => ReturnType;
      unsetBlockquote: () => ReturnType;
    };
  }
}

export const inputRegex = /^\s*>\s$/;

export const Blockquote = Node.create({
  name: 'blockquote',
  group: 'block',
  content: 'paragraph+',
  defining: true,

  addAttributes() {
    return {
      kind: {
        isRequired: true,
        parseHTML: (element) => {
          if (element.dataset.kind === undefined) {
            return 1;
          }

          const blockquote = Number.parseInt(element.dataset.kind);
          return closest(blockquote, blockquotes);
        },
        renderHTML: ({ kind }) => ({
          'class': css(
            { marginY: '[5.5px]', paddingLeft: '10px', borderColor: 'gray.900' },
            kind === 1 && { borderLeftWidth: '3px', paddingRight: '24px' },
            kind === 2 && {
              paddingRight: '24px',
              _before: { content: 'url(/blockquotes/carbon.svg)', display: 'block', width: '32px' },
            },
            kind === 3 && {
              textAlign: 'center',
              _before: { content: 'url(/blockquotes/carbon.svg)', display: 'block', marginX: 'auto', width: '32px' },
              _after: {
                content: 'url(/blockquotes/carbon.svg)',
                display: 'block',
                marginX: 'auto',
                width: '32px',
                rotate: '[180deg]',
              },
            },
          ),
          'data-kind': kind,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'blockquote' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['blockquote', HTMLAttributes, 0];
  },

  addCommands() {
    return {
      setBlockquote:
        (kind) =>
        ({ commands }) => {
          return commands.wrapIn(this.name, { kind });
        },
      toggleBlockquote:
        (kind) =>
        ({ commands }) => {
          return commands.toggleWrap(this.name, { kind });
        },
      unsetBlockquote:
        () =>
        ({ commands }) => {
          return commands.lift(this.name);
        },
    };
  },
});
