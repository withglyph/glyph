import { DropCursor, GapCursor, History, Placeholder, TextAlign } from '$lib/tiptap/extensions';
import { Bold, Italic, Strike, TextColor, Underline } from '$lib/tiptap/marks';
import { AccessBarrier } from '$lib/tiptap/node-views';
import { Document, HardBreak, Heading, Paragraph, Text } from '$lib/tiptap/nodes';

export const extensions = [
  // special nodes
  Document,
  Text,

  // nodes
  HardBreak,
  Heading,
  Paragraph,

  // marks
  Bold,
  Italic,
  Strike,
  TextColor,
  Underline,

  // extensions
  DropCursor,
  GapCursor,
  History,
  Placeholder,
  TextAlign,

  // node views
  AccessBarrier,
];
