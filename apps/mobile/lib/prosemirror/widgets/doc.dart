import 'package:flutter/material.dart';
import 'package:glyph/prosemirror/builder.dart';
import 'package:glyph/prosemirror/schema.dart';

class ProseMirrorWidgetDoc extends StatelessWidget {
  const ProseMirrorWidgetDoc({
    required this.child,
    super.key,
  });

  factory ProseMirrorWidgetDoc.node(ProseMirrorNode node) {
    return ProseMirrorWidgetDoc(
      child: ProseMirrorWidgetBuilder.build(node.content![0]),
    );
  }

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return child;
  }
}
