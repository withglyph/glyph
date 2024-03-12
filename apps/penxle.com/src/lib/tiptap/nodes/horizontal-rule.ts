import { Node } from '@tiptap/core';
import { closest } from '$lib/utils';
import { css } from '$styled-system/css';
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
          'class': css(
            {
              borderWidth: '0',
              marginX: 'auto',
              marginY: '12px',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            },
            kind === 1 && {
              height: '1px',
              backgroundRepeat: 'repeat',
              backgroundSize: '16px 1px',
              backgroundImage: '[linear-gradient(to right, #27272A 50%, rgb(255 255 255 / 0) 50%)]',
            },
            kind === 2 && { height: '1px', backgroundColor: 'gray.400' },
            kind === 3 && { height: '1px', backgroundColor: 'gray.400', width: '120px' },
            kind === 4 && { height: '28px', backgroundImage: '[url(/horizontal-rules/4.svg)]' },
            kind === 5 && { height: '14px', backgroundImage: '[url(/horizontal-rules/5.svg)]' },
            kind === 6 && { height: '15px', backgroundImage: '[url(/horizontal-rules/6.svg)]' },
            kind === 7 && { height: '20px', backgroundImage: '[url(/horizontal-rules/7.svg)]' },
            kind === 8 && { height: '12px', backgroundImage: '[url(/horizontal-rules/8.svg)]' },
          ),
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
