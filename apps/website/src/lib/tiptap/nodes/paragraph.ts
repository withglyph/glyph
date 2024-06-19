import { mergeAttributes, Node } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';
import { values } from '$lib/tiptap/values';
import { closest } from '$lib/utils';
import { css } from '$styled-system/css';
import type { NodeType, ResolvedPos } from '@tiptap/pm/model';

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
          { '& + &': { marginTop: 'var(--document-paragraph-spacing)' } },
          (node.attrs.textAlign === 'left' || node.attrs.textAlign === 'justify') && {
            textIndent: 'var(--document-paragraph-indent)',
          },
        ),
      }),
      0,
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

  addProseMirrorPlugins() {
    return [
      new Plugin({
        appendTransaction: (_, __, newState) => {
          const { selection, storedMarks, tr } = newState;
          const { $anchor, empty } = selection;

          if ($anchor.parent.type !== this.type) {
            return;
          }

          if (!empty || $anchor.parentOffset !== 0 || $anchor.parent.childCount !== 0) {
            return;
          }

          if (storedMarks !== null) {
            return;
          }

          const textNode = getTextNodeToCopyMarks(this.type, $anchor);
          if (textNode) {
            tr.ensureMarks(textNode.marks);
            return tr;
          }
        },
      }),
    ];
  },
});

const getTextNodeToCopyMarks = (type: NodeType, $pos: ResolvedPos) => {
  const currentNode = $pos.parent;

  for (let depth = $pos.depth - 1; depth > 0; depth--) {
    const node = $pos.node(depth);
    if (node.childCount === 0) {
      continue;
    }

    for (let idx = $pos.index(depth) - 1; idx >= 0; idx--) {
      let child = node.child(idx);
      if (child.type.name === 'list_item') {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        child = child.firstChild!;
      }

      if (child.type === type && child.childCount > 0 && child.attrs.textAlign === currentNode.attrs.textAlign) {
        for (let i = child.childCount - 1; i >= 0; i--) {
          const n = child.child(i);
          if (n.isText) {
            return n;
          }
        }
      }
    }
  }

  return null;
};
