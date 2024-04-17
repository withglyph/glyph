import { Extension } from '@tiptap/core';
import { Node, Slice } from '@tiptap/pm/model';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Loro, LoroList, LoroMap, LoroText } from 'loro-crdt';

// import type { EditorView } from '@tiptap/pm/view';

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Commands<ReturnType> {
    collaboration: {
      undo: () => ReturnType;
      redo: () => ReturnType;
    };
  }
}

type CollaborationOptions = {
  document: Loro;
  content: LoroProseMirrorNode;
};

type LoroProseMirrorAttrsShape = Record<string, unknown>;
type LoroProseMirrorAttrs = LoroMap<LoroProseMirrorAttrsShape>;

type LoroProseMirrorMarkShape = {
  type: string;
  attrs: LoroProseMirrorAttrs;
};
type LoroProseMirrorMark = LoroMap<LoroProseMirrorMarkShape>;

type LoroProseMirrorNodeShape = {
  type: string;
  attrs: LoroProseMirrorAttrs;
  marks: LoroList<LoroProseMirrorMark>;
  content: LoroList<LoroProseMirrorNode | undefined>;
};

type LoroProseMirrorTextNodeShape = {
  type: 'text';
  attrs: LoroProseMirrorAttrs;
  marks: LoroList<LoroProseMirrorMark>;
  text: LoroText;
};

export type LoroProseMirrorNode = LoroMap<LoroProseMirrorNodeShape>;
export type LoroProseMirrorTextNode = LoroMap<LoroProseMirrorTextNodeShape>;

const createLoroProseMirrorNode = (type: string): LoroProseMirrorNode => {
  const node = new LoroMap<LoroProseMirrorNodeShape>();
  node.set('type', type);
  node.setContainer('attrs', new LoroMap<LoroProseMirrorAttrsShape>());
  node.setContainer('marks', new LoroList<LoroProseMirrorMarkShape>());
  node.setContainer('content', new LoroList<LoroProseMirrorNode>());
  return node;
};

const createLoroProseMirrorTextNode = (): LoroProseMirrorTextNode => {
  const node = new LoroMap<LoroProseMirrorTextNodeShape>();
  node.set('type', 'text');
  node.setContainer('attrs', new LoroMap<LoroProseMirrorAttrsShape>());
  node.setContainer('marks', new LoroList<LoroProseMirrorMarkShape>());
  node.setContainer('text', new LoroText());
  return node;
};

const insertLoroProseMirrorNode = (
  parent: LoroProseMirrorNode,
  index: number,
  node: LoroProseMirrorNode | LoroProseMirrorTextNode,
) => {
  const content = parent.get('content');
  content.insertContainer(index, node);
};

const createLoroProseMirrorDocument = (node: Node): LoroProseMirrorNode => {
  const doc = createLoroProseMirrorNode(node.type.name);
  const mapping = new Map<Node, LoroProseMirrorNode>();
  mapping.set(node, doc);

  node.descendants((node, _, parent, index) => {
    if (parent === null) {
      return;
    }

    let loroNode;
    if (node.isText) {
      loroNode = createLoroProseMirrorTextNode();

      const attrs = loroNode.get('attrs');
      for (const [key, value] of Object.entries(node.attrs)) {
        attrs.set(key, value);
      }

      const marks = loroNode.get('marks');
      for (let i = 0; i < node.marks.length; i++) {
        const mark = node.marks[i];

        const loroMark = new LoroMap<LoroProseMirrorMarkShape>();
        loroMark.set('type', mark.type.name);

        const attrs = loroMark.setContainer('attrs', new LoroMap<LoroProseMirrorAttrsShape>());
        for (const [key, value] of Object.entries(mark.attrs)) {
          attrs.set(key, value);
        }

        marks.insertContainer(i, loroMark);
      }

      const text = loroNode.get('text');
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      text.insert(0, node.text!);
    } else {
      loroNode = createLoroProseMirrorNode(node.type.name);
      mapping.set(node, loroNode);

      const attrs = loroNode.get('attrs');
      for (const [key, value] of Object.entries(node.attrs)) {
        attrs.set(key, value);
      }

      const marks = loroNode.get('marks');
      for (let i = 0; i < node.marks.length; i++) {
        const mark = node.marks[i];

        const loroMark = new LoroMap<LoroProseMirrorMarkShape>();
        loroMark.set('type', mark.type.name);

        const attrs = loroMark.setContainer('attrs', new LoroMap<LoroProseMirrorAttrsShape>());
        for (const [key, value] of Object.entries(mark.attrs)) {
          attrs.set(key, value);
        }

        marks.insertContainer(i, loroMark);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const parentLoroNode = mapping.get(parent)!;
    insertLoroProseMirrorNode(parentLoroNode, index, loroNode);
  });

  return doc;
};

export const Collaboration = Extension.create<CollaborationOptions>({
  name: 'collaboration',
  priority: 1000,

  addCommands() {
    return {
      undo: () => () => {
        // tr.setMeta('preventDispatch', true);
        return true;
      },
      redo: () => () => {
        // tr.setMeta('preventDispatch', true);
        return true;
      },
    };
  },

  addProseMirrorPlugins() {
    const pluginKey = new PluginKey('collaboration');
    const loroDocument = this.options.document;
    // const loroContent =
    // this.options.content ?? loroDocument.getMap('root').setContainer('content', createLoroProseMirrorNode('doc'));

    loroDocument.subscribe((event) => {
      return;
      const content = loroDocument.getMap('root').get('content') as LoroProseMirrorNode;
      console.log(event);

      const node = Node.fromJSON(this.editor.schema, content.toJson());
      // this.editor.commands.setContent(loroDocument.toJson());
      const { tr } = this.editor.state;
      tr.setMeta('preventDispatch', true);
      tr.setMeta(pluginKey, true);

      const doc = this.editor.state.doc;

      tr.replace(0, doc.content.size, new Slice(node.content, 0, 0));
      this.editor.view.dispatch(tr);
    });

    return [
      new Plugin({
        key: pluginKey,
        state: {
          init: () => null,
          apply: (tr, value) => {
            if (!tr.docChanged || tr.getMeta(pluginKey) === true) {
              return value;
            }

            const doc = createLoroProseMirrorDocument(tr.doc);
            loroDocument.getMap('root').setContainer('content', doc);
            loroDocument.commit();

            // for (let i = 0; i < tr.steps.length; i++) {
            //   const step = tr.steps[i];
            //   const doc = tr.docs[i];

            //   if (step instanceof ReplaceStep) {
            //     const { from, to, slice } = step;
            //     // const $from = doc.resolve(from);
            //     // const $to = doc.resolve(to);

            //     doc.nodesBetween(from, to, (node, pos, parent, index) => {
            //       if (parent === null) {
            //         return;
            //       }
            //     });

            //     // root.getOrCreateContainer()

            //     // console.log(from, to);

            //     // $from.

            //     // console.log({ from, to });
            //     // doc.nodesBetween(from, to, (node, pos, parent) => {
            //     //   if (parent === null) {
            //     //     return;
            //     //   }

            //     //   console.log(node, pos);
            //     // });
            //     // slice.content.
            //   }
            // }

            return null;
          },
        },
      }),
    ];
  },

  addKeyboardShortcuts() {
    return {
      'Mod-z': () => this.editor.commands.undo(),
      'Mod-y': () => this.editor.commands.redo(),
      'Shift-Mod-z': () => this.editor.commands.redo(),
    };
  },
});
