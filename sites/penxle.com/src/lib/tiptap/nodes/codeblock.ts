import { Node, textblockTypeInputRule } from '@tiptap/core';
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state';

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Commands<ReturnType> {
    codeBlock: {
      toggleCodeBlock: (attributes?: { language: string }) => ReturnType;
    };
  }
}

const backtickInputRegex = /^`{3}([a-z]+)?\s$/;
const languageClassPrefix = 'language-';

export const CodeBlock = Node.create({
  name: 'code_block',
  group: 'block',
  content: 'text*',
  marks: '',
  code: true,
  defining: true,

  addAttributes() {
    return {
      language: {
        default: 'plaintext',
        parseHTML: (element) => {
          const classNames = [...(element.firstElementChild?.classList ?? [])];
          const languages = classNames
            .filter((className) => className.startsWith(languageClassPrefix))
            .map((className) => className.replace(languageClassPrefix, ''));
          const language = languages[0];

          if (!language) {
            return null;
          }

          return language;
        },
        rendered: false,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'pre',
        preserveWhitespace: 'full',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'pre',
      HTMLAttributes,
      [
        'code',
        {
          class: node.attrs.language
            ? languageClassPrefix + node.attrs.language
            : null,
        },
        0,
      ],
    ];
  },

  addCommands() {
    return {
      toggleCodeBlock:
        (attributes) =>
        ({ commands }) => {
          return commands.toggleNode(this.name, 'paragraph', attributes);
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-a': ({ editor }) => {
        const { $anchor } = editor.state.selection;

        if ($anchor.parent.type.name === this.name) {
          return editor.commands.selectParentNode();
        }
        return false;
      },

      'Backspace': ({ editor }) => {
        const { empty, $anchor } = editor.state.selection;
        const isAtStart = $anchor.pos === 1;

        if (!empty || $anchor.parent.type.name !== this.name) {
          return false;
        }

        if (isAtStart || $anchor.parent.textContent.length === 0) {
          return editor.commands.clearNodes();
        }

        return false;
      },

      'Enter': ({ editor }) => {
        const { $from, empty } = editor.state.selection;

        if (!empty || $from.parent.type !== this.type) {
          return false;
        }

        const isAtEnd = $from.parentOffset === $from.parent.nodeSize - 2;
        const endsWithDoubleNewline = $from.parent.textContent.endsWith('\n\n');

        if (!isAtEnd || !endsWithDoubleNewline) {
          return false;
        }

        return editor
          .chain()
          .command(({ tr }) => {
            tr.delete($from.pos - 2, $from.pos);

            return true;
          })
          .exitCode()
          .run();
      },

      'ArrowDown': ({ editor }) => {
        const { selection, doc } = editor.state;
        const { $from, empty } = selection;

        if (!empty || $from.parent.type !== this.type) {
          return false;
        }

        const isAtEnd = $from.parentOffset === $from.parent.nodeSize - 2;

        if (!isAtEnd) {
          return false;
        }

        const after = $from.after();

        if (!after) {
          return false;
        }

        const nodeAfter = doc.nodeAt(after);

        if (nodeAfter) {
          return false;
        }

        return editor.commands.exitCode();
      },
    };
  },

  addInputRules() {
    return [
      textblockTypeInputRule({
        find: backtickInputRegex,
        type: this.type,
        getAttributes: (match) => ({
          language: match[1],
        }),
      }),
    ];
  },

  addProseMirrorPlugins() {
    return [
      // VSCode에서 복사된 내용 붙여넣기 시 자동으로 코드블럭 생성. 언어 자동감지
      new Plugin({
        key: new PluginKey('codeBlockVSCodeHandler'),
        props: {
          handlePaste: (view, event) => {
            if (!event.clipboardData) {
              return false;
            }

            // 코드블럭 안에서 코드블럭이 또 생성되는 것 방지
            if (this.editor.isActive(this.type.name)) {
              return false;
            }

            const text = event.clipboardData.getData('text/plain');
            const vscode = event.clipboardData.getData('vscode-editor-data');
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const vscodeData = vscode ? JSON.parse(vscode) : undefined;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            const language = vscodeData?.mode;

            if (!text || !language) {
              return false;
            }

            const { tr } = view.state;

            // 새로운 코드블럭 생성, 새 코드블럭 안으로 커서 이동
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            tr.replaceSelectionWith(this.type.create({ language }));

            tr.setSelection(
              TextSelection.near(
                tr.doc.resolve(Math.max(0, tr.selection.from - 2)),
              ),
            );

            tr.insertText(text.replaceAll(/\r\n?/g, '\n'));

            // 메타 데이터 저장. paste 규칙 플러그인과 같은 다른 플러그인 사용 시 유용함
            tr.setMeta('paste', true);

            view.dispatch(tr);

            return true;
          },
        },
      }),
    ];
  },
});
