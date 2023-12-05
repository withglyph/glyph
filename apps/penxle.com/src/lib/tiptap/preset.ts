import {
  DropCursor,
  FontFamily,
  GapCursor,
  History,
  LetterSpacing,
  LineHeight,
  Link,
  Placeholder,
  TextAlign,
} from '$lib/tiptap/extensions';
import { Bold, Italic, Strike, TextColor, Underline } from '$lib/tiptap/marks';
import { AccessBarrier, File, Image } from '$lib/tiptap/node-views';
import { Document, HardBreak, Heading, HorizontalRule, Paragraph, Text } from '$lib/tiptap/nodes';
import { Blockquote } from './nodes/blockquote';

export const extensions = [
  // special nodes
  Document,
  Text,

  // nodes
  HardBreak,
  Heading,
  Paragraph,
  HorizontalRule,
  Blockquote,

  // marks
  Bold,
  Italic,
  Strike,
  TextColor,
  Underline,
  Link,

  // extensions
  DropCursor,
  GapCursor,
  History,
  Placeholder,
  TextAlign,
  FontFamily,
  LineHeight,
  LetterSpacing,

  // node views
  AccessBarrier,
  File,
  Image,
];
