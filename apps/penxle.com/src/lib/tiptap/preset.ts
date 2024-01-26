import { production } from '@penxle/lib/environment';
import { DropCursor, GapCursor, History, Placeholder } from '$lib/tiptap/extensions';
import {
  LegacyFontFamily,
  LegacyHeading,
  LegacyHorizontalRule,
  LegacyLetterSpacing,
  LegacyLineHeight,
  LegacyTextAlign,
  LegacyTextColor,
} from '$lib/tiptap/legacies';
import { Bold, FontColor, FontFamily, FontSize, Italic, Link, Strike, Underline } from '$lib/tiptap/marks';
import { AccessBarrier, Embed, File, Image, Table } from '$lib/tiptap/node-views';
import {
  BulletList,
  Document,
  HardBreak,
  HorizontalRule,
  ListItem,
  OrderedList,
  Paragraph,
  TableCell,
  TableHeader,
  TableRow,
  Text,
} from '$lib/tiptap/nodes';
import { Blockquote } from './nodes/blockquote';

export const extensions = [
  // special nodes
  Document,
  Text,

  // nodes
  HardBreak,
  LegacyHeading,
  Paragraph,
  HorizontalRule,
  LegacyHorizontalRule,
  Blockquote,
  ListItem,
  BulletList,
  OrderedList,
  TableCell,
  TableHeader,
  TableRow,

  // marks
  Bold,
  FontColor,
  FontFamily,
  FontSize,
  Italic,
  Strike,
  Underline,
  Link,

  // extensions
  DropCursor,
  GapCursor,
  History,
  Placeholder,

  // node views
  AccessBarrier,
  ...(production ? [] : [Embed]),
  File,
  Image,
  Table,

  // legacies
  LegacyTextColor,
  LegacyTextAlign,
  LegacyFontFamily,
  LegacyLineHeight,
  LegacyLetterSpacing,
];
