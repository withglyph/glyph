import {mkdtemp,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import { Case } from 'change-case-all';
import {FontAssetType,generateFonts} from 'fantasticon';
import SVGFixer from 'oslllo-svg-fixer';

const tmp = await mkdtemp(path.join(tmpdir(), 'icons-'));

await SVGFixer('icons', tmp).fix()

const {codepoints} = await generateFonts({
  inputDir: tmp,
  outputDir: '.',
  assetTypes: [],
  fontTypes: [FontAssetType.TTF],
  name: 'GlyphIcons',
  fontHeight: 1000,
  pathOptions: {
    ttf: 'assets/fonts/GlyphIcons.ttf',
  }
});

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

const entries = Object.entries(codepoints).reverse().map(([name, codepoint]) => {
  let n = Case.snake(name);
  if (dartKeywords.has(n)) {
    n = `${n}_`;
  }

  return `static const IconData ${n} = IconData(${codepoint & 0xff_ff}, fontFamily: fontFamily);`
});

await writeFile('lib/icons/glyph.dart', `
// ignore_for_file: constant_identifier_names

import 'package:flutter/material.dart';

@staticIconProvider
abstract final class Glyph {
  static const String fontFamily = 'GlyphIcons';
  ${entries.join('\n')}
}
`)