import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:collection/collection.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:glyph/prosemirror/builder.dart';
import 'package:glyph/prosemirror/schema.dart';
import 'package:glyph/prosemirror/special/padded.dart';
import 'package:glyph/prosemirror/widgets/document.dart';

class ProseMirrorWidgetOrderedList extends StatelessWidget {
  const ProseMirrorWidgetOrderedList({
    required this.children,
    super.key,
  });

  factory ProseMirrorWidgetOrderedList.node(ProseMirrorNode node) {
    return ProseMirrorWidgetOrderedList(
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
          children: children.mapIndexed((i, child) {
            return Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const Pad(top: 1),
                  child: Text(
                    '${i + 1}.',
                    style: const TextStyle(
                      fontSize: 16,
                      height: 1.6,
                      fontFeatures: [FontFeature.tabularFigures()],
                    ),
                  ),
                ),
                const Gap(8),
                Expanded(child: child),
              ],
            );
          }).toList(),
        ),
      ),
    );
  }
}
