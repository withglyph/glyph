import { mergeAttributes, Node } from '@tiptap/core';
import clsx from 'clsx';
import { values } from '$lib/tiptap/values';
import { closest } from '$lib/utils';

const textAligns = values.textAlign.map(({ value }) => value);
type TextAlign = (typeof textAligns)[number];

const lineHeights = values.lineHeight.map(({ value }) => value);
type LineHeight = (typeof lineHeights)[number];

const letterSpacings = values.letterSpacing.map(({ value }) => value);
type LetterSpacing = (typeof letterSpacings)[number];

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Commands<ReturnType> {
    paragraph: {
      setParagraph: () => ReturnType;
      setParagraphTextAlign: (textAlign: TextAlign) => ReturnType;
      setParagraphLineHeight: (lineHeight: LineHeight) => ReturnType;
      setParagraphLetterSpacing: (letterSpacing: LetterSpacing) => ReturnType;
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
        default: undefined,
        renderHTML: ({ level }) => ({
          class: clsx(level === 2 && 'body-13-m'),
        }),
      },

      textAlign: {
        default: 'left',
        parseHTML: (element) => {
          const textAlign = element.style.textAlign;
          if (!(textAligns as string[]).includes(textAlign)) {
            return 'left';
          }

          return textAlign;
        },
        renderHTML: ({ textAlign }) => ({
          style: `text-align: ${textAlign}`,
        }),
      },

      lineHeight: {
        default: 1.6,
        parseHTML: (element) => {
          const lineHeight = Number.parseFloat(element.style.lineHeight);
          return closest(lineHeight, lineHeights) ?? 1.6;
        },
        renderHTML: ({ lineHeight }) => ({
          style: `line-height: ${lineHeight}`,
        }),
      },

      letterSpacing: {
        default: 0,
        parseHTML: (element) => {
          const letterSpacing = Number.parseFloat(element.style.letterSpacing.replace(/em$/, ''));
          return closest(letterSpacing, letterSpacings) ?? 0;
        },
        renderHTML: ({ letterSpacing }) => ({
          style: `letter-spacing: ${letterSpacing}em`,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'p' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'p',
      mergeAttributes(HTMLAttributes, { class: '1py-0.5' }),
      !this.editor?.isEditable && node.childCount === 0 ? ['br'] : 0,
    ];
  },

  addCommands() {
    return {
      setParagraph:
        () =>
        ({ commands }) => {
          return commands.setNode(this.name);
        },

      setParagraphTextAlign:
        (textAlign) =>
        ({ commands }) => {
          if (!textAligns.includes(textAlign)) {
            return false;
          }

          return commands.updateAttributes(this.name, { textAlign });
        },

      setParagraphLineHeight:
        (lineHeight) =>
        ({ commands }) => {
          if (!lineHeights.includes(lineHeight)) {
            return false;
          }

          return commands.updateAttributes(this.name, { lineHeight });
        },

      setParagraphLetterSpacing:
        (letterSpacing) =>
        ({ commands }) => {
          if (!letterSpacings.includes(letterSpacing)) {
            return false;
          }

          return commands.updateAttributes(this.name, { letterSpacing });
        },
    };
  },
});
