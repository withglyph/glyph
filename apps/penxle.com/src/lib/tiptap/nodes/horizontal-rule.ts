import { mergeAttributes, Node } from '@tiptap/core';
import { NodeSelection, TextSelection } from '@tiptap/pm/state';

export type HorizontalRuleOptions = {
  HTMLAttributes: Record<string, unknown>;
};

export type Kind = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type Attributes = { kind: Kind };

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Commands<ReturnType> {
    horizontalRule: {
      /**
       * Add a horizontal rule
       */
      setHorizontalRule: (kind: Kind) => ReturnType;
    };
  }
}

export const HorizontalRule = Node.create<HorizontalRuleOptions>({
  name: 'horizontalRule',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      kind: {
        default: 1,
        parseHTML: (element) => element.dataset.kind && Number.parseInt(element.dataset.kind, 10),
        renderHTML: (attributes: Attributes) => ({ 'data-kind': attributes.kind.toString() }),
      },
    };
  },

  group: 'block',

  parseHTML() {
    return [{ tag: 'hr' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['hr', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
  },

  addCommands() {
    return {
      setHorizontalRule:
        (kind) =>
        ({ chain, state }) => {
          const { $to: $originTo } = state.selection;

          const currentChain = chain();

          if ($originTo.parentOffset === 0) {
            currentChain.insertContentAt(Math.max($originTo.pos - 2, 0), { type: this.name, attrs: { kind } });
          } else {
            currentChain.insertContent({ type: this.name, attrs: { kind } });
          }

          return (
            currentChain
              // set cursor after horizontal rule
              .command(({ tr, dispatch }) => {
                if (dispatch) {
                  const { $to } = tr.selection;
                  const posAfter = $to.end();

                  if ($to.nodeAfter) {
                    if ($to.nodeAfter.isTextblock) {
                      tr.setSelection(TextSelection.create(tr.doc, $to.pos + 1));
                    } else if ($to.nodeAfter.isBlock) {
                      tr.setSelection(NodeSelection.create(tr.doc, $to.pos));
                    } else {
                      tr.setSelection(TextSelection.create(tr.doc, $to.pos));
                    }
                  } else {
                    // add node after horizontal rule if it’s the end of the document
                    const node = $to.parent.type.contentMatch.defaultType?.create();

                    if (node) {
                      tr.insert(posAfter, node);
                      tr.setSelection(TextSelection.create(tr.doc, posAfter + 1));
                    }
                  }

                  tr.scrollIntoView();
                }

                return true;
              })
              .run()
          );
        },
    };
  },
});
