import { Node } from '@tiptap/core';
import clsx from 'clsx';
import { closest } from '$lib/utils';
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
          'class': clsx(
            'border-text-primary pl-0.625rem my-0.34375rem',
            kind === 1 && 'border-l-0.1875rem pr-6',
            kind === 2 && 'pr-6 before:(block w-2rem content-[url(/blockquotes/carbon.svg)])',
            kind === 3 &&
              'text-center before:(block w-2rem mx-auto content-[url(/blockquotes/carbon.svg)]) after:(block w-2rem rotate-180 mx-auto content-[url(/blockquotes/carbon.svg)])',
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
