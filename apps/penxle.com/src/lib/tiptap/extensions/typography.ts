import { Extension, textInputRule } from '@tiptap/core';

export const Typography = Extension.create({
  name: 'typography',

  addInputRules() {
    return [
      textInputRule({
        find: /--$/,
        replace: '—',
      }),

      textInputRule({
        find: /\.{3}$/,
        replace: '…',
      }),

      textInputRule({
        find: /\u201C[^\u201D]*(")$/,
        replace: '”',
      }),
      textInputRule({
        find: /(?:^|[^\u201C])(")$/,
        replace: '“',
      }),

      textInputRule({
        find: /\u2018[^\u2019]*(')$/,
        replace: '’',
      }),
      textInputRule({
        find: /(?:^|[^\u2018])(')$/,
        replace: '‘',
      }),
    ];
  },
});
