import 'package:flutter/material.dart';
import 'package:glyph/prosemirror/schema.dart';

class ProseMirrorSpanHardBreak extends TextSpan {
  const ProseMirrorSpanHardBreak() : super(text: '\n');

  factory ProseMirrorSpanHardBreak.node(ProseMirrorNode _) {
    return const ProseMirrorSpanHardBreak();
  }
}
