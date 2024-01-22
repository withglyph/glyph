import { Node } from '@tiptap/core';
import clsx from 'clsx';
import { closest } from '$lib/utils';
import { values } from '../values';

const horizontalRules = values.horizontalRule.map(({ value }) => value);
type HorizontalRule = (typeof horizontalRules)[number];

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Commands<ReturnType> {
    horizontalRule: {
      setHorizontalRule: (kind: HorizontalRule) => ReturnType;
    };
  }
}

export const HorizontalRule = Node.create({
  name: 'horizontal_rule',
  group: 'block',

  addAttributes() {
    return {
      kind: {
        isRequired: true,
        parseHTML: (element) => {
          if (element.dataset.kind === undefined) {
            return 1;
          }

          const horizontalRule = Number.parseInt(element.dataset.kind);
          return closest(horizontalRule, horizontalRules);
        },
        renderHTML: ({ kind }) => ({
          'class': clsx(
            'bg-no-repeat border-none bg-center m-y-xs m-x-auto',
            kind === 1 && 'h-0.0625rem bg-repeat!',
            kind === 2 && 'border-1 border-solid border-current',
            kind === 3 && 'border-1 border-solid border-current w-7.5rem',
            kind === 4 && 'h-1.8rem bg-[url(/horizontal-rules/4.svg)]',
            kind === 5 && 'h-0.875rem bg-[url(/horizontal-rules/5.svg)]',
            kind === 6 && 'h-0.91027rem bg-[url(/horizontal-rules/6.svg)]',
            kind === 7 && 'h-1.25rem bg-[url(/horizontal-rules/7.svg)]',
          ),
          'style':
            kind === 1
              ? 'background-size: 16px 1px; background-image: linear-gradient(to right, currentColor 50%, rgb(255 255 255 / 0) 50%);'
              : undefined,
          'data-kind': kind,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'hr' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['hr', HTMLAttributes];
  },

  addCommands() {
    return {
      setHorizontalRule:
        (kind) =>
        ({ commands }) => {
          return commands.insertContent({ type: this.name, attrs: { kind } });
        },
    };
  },
});
