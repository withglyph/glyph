import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:glyph/prosemirror/schema.dart';
import 'package:glyph/prosemirror/spans/hard_break.dart';
import 'package:glyph/prosemirror/spans/text.dart';
import 'package:glyph/prosemirror/widgets/doc.dart';
import 'package:glyph/prosemirror/widgets/document.dart';
import 'package:glyph/prosemirror/widgets/image.dart';
import 'package:glyph/prosemirror/widgets/paragraph.dart';

abstract final class ProseMirrorWidgetBuilder {
  static final _builders = <String, Widget Function(ProseMirrorNode)>{
    'doc': ProseMirrorWidgetDoc.node,
    'document': ProseMirrorWidgetDocument.node,
    'paragraph': ProseMirrorWidgetParagraph.node,
    'image': ProseMirrorWidgetImage.node,
  };

  static Widget build(ProseMirrorNode node) {
    final builder = _builders[node.type];
    if (builder == null) {
      if (kDebugMode) {
        print('No widget builder for ${node.type}');
      }

      return const SizedBox.shrink();
    }

    return builder(node);
  }
}

abstract final class ProseMirrorSpanBuilder {
  static final _builders = <String, InlineSpan Function(ProseMirrorNode)>{
    'text': ProseMirrorSpanText.node,
    'hard_break': ProseMirrorSpanHardBreak.node,
  };

  static InlineSpan build(ProseMirrorNode node) {
    final builder = _builders[node.type];
    if (builder == null) {
      if (kDebugMode) {
        print('No span builder for ${node.type}');
      }

      return const TextSpan(text: '');
    }

    return builder(node);
  }
}
