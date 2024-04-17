import { mergeAttributes, Node } from '@tiptap/core';
import { values } from '$lib/tiptap/values';
import { closest } from '$lib/utils';
import { css } from '$styled-system/css';

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
      mergeAttributes(HTMLAttributes, {
        class: css(
          node.attrs.textAlign === 'left' && {
            marginBottom: 'var(--document-paragraph-spacing)',
            textIndent: 'var(--document-paragraph-indent)',
          },
        ),
      }),
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

  // addProseMirrorPlugins() {
  //   return [
  //     new Plugin({
  //       appendTransaction: (_, __, newState) => {
  //         const { doc, selection, storedMarks, tr } = newState;
  //         const { $from, empty } = selection;

  //         if (
  //           $from.parent.type.name !== this.name ||
  //           !empty ||
  //           $from.parentOffset !== 0 ||
  //           $from.parent.childCount !== 0 ||
  //           storedMarks?.length
  //         ) {
  //           return;
  //         }

  //         const lastNode = findChildren(doc, (node) => node.type.name === this.name).findLast(
  //           ({ node, pos }) => node.childCount > 0 && pos < $from.pos,
  //         );

  //         const lastChild = lastNode?.node.lastChild;
  //         if (!lastChild) {
  //           return;
  //         }

  //         return tr.setStoredMarks(lastChild.marks);
  //       },
  //     }),
  //   ];
  // },
});
