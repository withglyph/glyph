import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/dot.dart';
import 'package:glyph/prosemirror/builder.dart';
import 'package:glyph/prosemirror/schema.dart';
import 'package:glyph/prosemirror/special/padded.dart';
import 'package:glyph/prosemirror/widgets/document.dart';
import 'package:glyph/themes/colors.dart';

class ProseMirrorWidgetBulletList extends StatelessWidget {
  const ProseMirrorWidgetBulletList({
    required this.children,
    super.key,
  });

  factory ProseMirrorWidgetBulletList.node(ProseMirrorNode node) {
    return ProseMirrorWidgetBulletList(
      children: node.content?.map(ProseMirrorWidgetBuilder.build).toList() ?? [],
    );
  }

  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    final documentData = ProseMirrorWidgetDocumentData.of(context);

    return ProseMirrorPadded(
      child: ProseMirrorWidgetDocumentData(
        documentParagraphIndent: 0,
        documentParagraphSpacing: documentData.documentParagraphSpacing,
        child: Column(
          children: children.map((child) {
            return Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Padding(
                  padding: Pad(top: 12),
                  child: Dot(size: 4, color: BrandColors.gray_900),
                ),
                const Gap(16),
                Expanded(child: child),
              ],
            );
          }).toList(),
        ),
      ),
    );
  }
}
