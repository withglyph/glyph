import {
  combineTransactionSteps,
  findChildrenInRange,
  getChangedRanges,
  getMarksBetween,
  Mark,
  mergeAttributes,
} from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';
import { find } from 'linkifyjs';
import { css } from '$styled-system/css';

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Commands<ReturnType> {
    link: {
      setLink: (href: string) => ReturnType;
      updateLink: (href: string) => ReturnType;
      unsetLink: () => ReturnType;
    };
  }
}

export const Link = Mark.create({
  name: 'link',
  inclusive: false,
  keepOnSplit: false,

  addAttributes() {
    return {
      href: { isRequired: true },
      auto: { default: false },
    };
  },

  parseHTML() {
    return [{ tag: 'a' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'a',
      mergeAttributes(HTMLAttributes, {
        class: css({ color: 'gray.500', textDecorationLine: 'underline' }),
        target: '_blank',
        rel: 'noreferrer nofollow',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setLink:
        (href) =>
        ({ chain }) => {
          return chain().setMark(this.name, { href }).run();
        },

      updateLink:
        (href) =>
        ({ chain }) => {
          return chain().extendMarkRange(this.name).updateAttributes(this.name, { href }).run();
        },

      unsetLink:
        () =>
        ({ chain }) => {
          return chain().unsetMark(this.name, { extendEmptyMarkRange: true }).setMeta('preventLink', true).run();
        },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        appendTransaction: (transactions, oldState, newState) => {
          const docChanges =
            transactions.some((transaction) => transaction.docChanged) && !oldState.doc.eq(newState.doc);
          const preventLink = transactions.some((transaction) => transaction.getMeta('preventLink'));

          if (!docChanges || preventLink) {
            return;
          }

          const { tr } = newState;
          const transform = combineTransactionSteps(oldState.doc, [...transactions]);
          const changes = getChangedRanges(transform);

          for (const { newRange } of changes) {
            const nodes = findChildrenInRange(newState.doc, newRange, (node) => node.isTextblock);
            for (const node of nodes) {
              const text = newState.doc.textBetween(node.pos, node.pos + node.node.nodeSize, ' ', ' ');
              const links = find(text).filter((link) => link.isLink);

              const autoLinks = getMarksBetween(node.pos, node.pos + node.node.nodeSize, newState.doc).filter(
                ({ mark }) => mark.type.name === this.name && mark.attrs.auto,
              );

              for (const autoLink of autoLinks) {
                tr.removeMark(autoLink.from, autoLink.to, this.type);
              }

              for (const link of links) {
                tr.addMark(
                  node.pos + link.start + 1,
                  node.pos + link.end + 1,
                  this.type.create({
                    href: link.href,
                    auto: true,
                  }),
                );
              }
            }
          }

          if (tr.steps.length === 0) {
            return;
          }

          return tr;
        },
      }),
    ];
  },
});
