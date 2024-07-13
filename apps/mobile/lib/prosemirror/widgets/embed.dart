import 'package:flutter/material.dart';
import 'package:glyph/prosemirror/schema.dart';
import 'package:glyph/prosemirror/special/webview.dart';

class ProseMirrorWidgetEmbed extends StatelessWidget {
  const ProseMirrorWidgetEmbed({
    required this.node,
    super.key,
  });

  factory ProseMirrorWidgetEmbed.node(ProseMirrorNode node) {
    return ProseMirrorWidgetEmbed(
      node: node,
    );
  }

  final ProseMirrorNode node;

  @override
  Widget build(BuildContext context) {
    return ProseMirrorWebView(node: node);
  }
}
