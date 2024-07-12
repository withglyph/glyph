import 'package:flutter/material.dart';
import 'package:glyph/prosemirror/builder.dart';
import 'package:glyph/prosemirror/schema.dart';

class ProseMirrorWidgetListItem extends StatelessWidget {
  const ProseMirrorWidgetListItem({
    required this.children,
    super.key,
  });

  factory ProseMirrorWidgetListItem.node(ProseMirrorNode node) {
    return ProseMirrorWidgetListItem(
      children: node.content?.map(ProseMirrorWidgetBuilder.build).toList() ?? [],
    );
  }

  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: children,
    );
  }
}
