import 'package:flutter/material.dart';
import 'package:glyph/prosemirror/schema.dart';
import 'package:glyph/prosemirror/special/webview.dart';

class ProseMirrorWidgetCodeBlock extends StatefulWidget {
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
  createState() => _ProseMirrorWidgetCodeBlockState();
}

class _ProseMirrorWidgetCodeBlockState extends State<ProseMirrorWidgetCodeBlock> with AutomaticKeepAliveClientMixin {
  @override
  Widget build(BuildContext context) {
    super.build(context);

    return ProseMirrorWebView(node: widget.node);
  }

  @override
  bool get wantKeepAlive => true;
}
