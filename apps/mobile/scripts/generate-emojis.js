import {writeFile} from 'node:fs/promises';
import emojis from 'emojibase-data/en/shortcodes/iamcal.json' assert { type: "json" };

const dartKeywords = new Set([
  'abstract', 'as', 'assert', 'async',
  'await', 'base', 'break', 'case',
  'catch', 'class', 'const', 'continue',
  'covariant', 'default', 'deferred', 'do',
  'dynamic', 'else', 'enum', 'export',
  'extends', 'extension', 'external', 'factory',
  'false', 'final', 'final', 'finally',
  'for', 'Function', 'get', 'hide',
  'if', 'implements', 'import', 'in',
  'interface', 'is', 'late', 'library',
  'mixin', 'new', 'null', 'of',
  'on', 'operator', 'part', 'required',
  'rethrow', 'return', 'sealed', 'set',
  'show', 'static', 'super', 'switch',
  'sync', 'this', 'throw', 'true',
  'try', 'type', 'typedef', 'var',
  'void', 'when', 'with', 'while',
  'yield'
]);

const entries = Object.entries(emojis).map(([codepoint, code]) => {
  if (!Array.isArray(code)) {
    code = [code];
  }

  return code.map(code => {
    if (dartKeywords.has(code)) {
      code = `${code}_`;
    }

    if (/^\d/.test(code)) {
      code = `n${code}`;
    }

    if (code == '+1') {
      code = 'thumbs_up';
    } else if (code == '-1') {
      code = 'thumbs_down';
    }

    code = code.replaceAll(/[^\da-z]/g, '_');

    return `static const EmojiData ${code} = EmojiData('${codepoint.toLowerCase()}');`;
  });
});

const entries2 = Object.entries(emojis).map(([, code]) => {
  if (!Array.isArray(code)) {
    code = [code];
  }

  return code.map(orig => {
    let code = orig;
    if (dartKeywords.has(code)) {
      code = `${code}_`;
    }

    if (/^\d/.test(code)) {
      code = `n${code}`;
    }

    if (code == '+1') {
      code = 'thumbs_up';
    } else if (code == '-1') {
      code = 'thumbs_down';
    }

    code = code.replaceAll(/[^\da-z]/g, '_');

    return `'${orig}' => ${code},`;
  });
});

await writeFile('lib/emojis/data.dart', `
// ignore_for_file: constant_identifier_names

import 'package:glyph/emojis/emoji.dart';

abstract final class Emojis {
  ${entries.flat().join('\n')}

  static EmojiData fromShortCode(String shortCode) {
    return switch (shortCode) {
      ${entries2.flat().join('\n')}
      _ => throw Exception('Unknown emoji: $shortCode'),
    };
  }
}
`)