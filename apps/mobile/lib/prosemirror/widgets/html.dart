import 'package:flutter/material.dart';
import 'package:glyph/prosemirror/schema.dart';
import 'package:glyph/prosemirror/special/webview.dart';

class ProseMirrorWidgetHtml extends StatelessWidget {
  const ProseMirrorWidgetHtml({
    required this.node,
    super.key,
  });

  factory ProseMirrorWidgetHtml.node(ProseMirrorNode node) {
    return ProseMirrorWidgetHtml(
      node: node,
    );
  }

  final ProseMirrorNode node;

  @override
  Widget build(BuildContext context) {
    return ProseMirrorWebView(node: node);
  }
}
