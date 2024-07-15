import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:flutter/material.dart';
import 'package:glyph/prosemirror/schema.dart';
import 'package:glyph/prosemirror/special/embedded_webview.dart';
import 'package:glyph/prosemirror/special/padded.dart';
import 'package:glyph/themes/colors.dart';

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
    return ProseMirrorPadded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const DecoratedBox(
            decoration: BoxDecoration(color: BrandColors.gray_100),
            child: Padding(
              padding: Pad(horizontal: 10, vertical: 5),
              child: Text(
                'HTML',
                style: TextStyle(
                  color: BrandColors.gray_400,
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ),
          DecoratedBox(
            decoration: BoxDecoration(
              border: Border.all(color: BrandColors.gray_150),
            ),
            child: ProseMirrorEmbeddedWebView(
              html: node.content?.first.text ?? '',
            ),
          ),
        ],
      ),
    );
  }
}
