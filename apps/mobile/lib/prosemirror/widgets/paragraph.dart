import 'package:flutter/material.dart';
import 'package:glyph/prosemirror/builder.dart';
import 'package:glyph/prosemirror/schema.dart';
import 'package:glyph/prosemirror/special/padding.dart';
import 'package:glyph/prosemirror/widgets/document.dart';

class ProseMirrorWidgetParagraph extends StatelessWidget {
  const ProseMirrorWidgetParagraph({
    required this.textAlign,
    required this.lineHeight,
    required this.letterSpacing,
    required this.children,
    super.key,
  });

  factory ProseMirrorWidgetParagraph.node(ProseMirrorNode node) {
    return ProseMirrorWidgetParagraph(
      textAlign: node.attrs?['textAlign'] as String? ?? 'left',
      lineHeight: (node.attrs?['lineHeight'] as num?)?.toDouble() ?? 1.6,
      letterSpacing: (node.attrs?['letterSpacing'] as num?)?.toDouble() ?? 0,
      children: node.content?.map(ProseMirrorSpanBuilder.build).toList() ?? [],
    );
  }

  final String textAlign;
  final double lineHeight;
  final double letterSpacing;
  final List<InlineSpan> children;

  @override
  Widget build(BuildContext context) {
    return ProseMirrorPadded(
      child: RichText(
        textAlign: switch (textAlign) {
          'left' => TextAlign.left,
          'center' => TextAlign.center,
          'right' => TextAlign.right,
          'justify' => TextAlign.justify,
          _ => TextAlign.left,
        },
        text: TextSpan(
          style: TextStyle(
            height: lineHeight,
            letterSpacing: letterSpacing,
          ),
          children: [
            if (textAlign == 'left' || textAlign == 'justify')
              WidgetSpan(
                child: SizedBox(
                  width: ProseMirrorWidgetDocumentData.of(context).documentParagraphIndent * 16,
                ),
              ),
            ...children,
          ],
        ),
      ),
    );
  }
}
