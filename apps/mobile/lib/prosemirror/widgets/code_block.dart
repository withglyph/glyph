import 'package:flutter/material.dart';
import 'package:glyph/prosemirror/schema.dart';
import 'package:glyph/prosemirror/special/webview.dart';

class ProseMirrorWidgetCodeBlock extends StatelessWidget {
  const ProseMirrorWidgetCodeBlock({
    required this.node,
    super.key,
  });

  factory ProseMirrorWidgetCodeBlock.node(ProseMirrorNode node) {
    return ProseMirrorWidgetCodeBlock(
      node: node,
    );
  }

  final ProseMirrorNode node;

  @override
  Widget build(BuildContext context) {
    return ProseMirrorWebView(node: node);
  }
}
