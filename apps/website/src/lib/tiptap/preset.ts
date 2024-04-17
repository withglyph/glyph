import { DropCursor, GapCursor, Placeholder, Typography } from '$lib/tiptap/extensions';
import { Bold, FontColor, FontFamily, FontSize, Italic, Link, Ruby, Strike, Underline } from '$lib/tiptap/marks';
import { AccessBarrier, Embed, File, Gallery, Html, Image } from '$lib/tiptap/node-views';
import {
  Blockquote,
  BulletList,
  Doc,
  Document,
  HardBreak,
  HorizontalRule,
  ListItem,
  OrderedList,
  Paragraph,
  Text,
} from '$lib/tiptap/nodes';

export const extensions = [
  // special nodes
  Doc,
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
  Placeholder,
  Typography,

  // node views
  AccessBarrier,
  Embed,
  File,
  Gallery,
  Html,
  Image,
];
