import { DropCursor, GapCursor, History, Placeholder } from '$lib/tiptap/extensions';
import { Bold, FontColor, FontFamily, FontSize, Italic, Link, Ruby, Strike, Underline } from '$lib/tiptap/marks';
import { AccessBarrier, Embed, File, Image } from '$lib/tiptap/node-views';
import {
  BulletList,
  Document,
  HardBreak,
  HorizontalRule,
  ListItem,
  OrderedList,
  Paragraph,
  Text,
} from '$lib/tiptap/nodes';
import { Blockquote } from './nodes/blockquote';

export const extensions = [
  // special nodes
  Document,
  Text,

  // nodes
  HardBreak,
  Paragraph,
  HorizontalRule,
  Blockquote,
  ListItem,
  BulletList,
  OrderedList,

  // marks
  Bold,
  FontColor,
  FontFamily,
  FontSize,
  Italic,
  Strike,
  Underline,
  Link,
  Ruby,

  // extensions
  DropCursor,
  GapCursor,
  History,
  Placeholder,

  // node views
  AccessBarrier,
  Embed,
  File,
  Image,
];
