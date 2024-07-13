import 'dart:math';

import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/svg_image.dart';
import 'package:glyph/extensions/iterable.dart';
import 'package:glyph/prosemirror/builder.dart';
import 'package:glyph/prosemirror/schema.dart';
import 'package:glyph/prosemirror/special/padded.dart';
import 'package:glyph/prosemirror/widgets/document.dart';
import 'package:glyph/themes/colors.dart';

class ProseMirrorWidgetBlockquote extends StatelessWidget {
  const ProseMirrorWidgetBlockquote({
    required this.kind,
    required this.children,
    super.key,
  });

  factory ProseMirrorWidgetBlockquote.node(ProseMirrorNode node) {
    return ProseMirrorWidgetBlockquote(
      kind: node.attrs?['kind'] as int? ?? 1,
      children: node.content?.map(ProseMirrorWidgetBuilder.build).toList() ?? [],
    );
  }

  final int kind;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    final child = Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children:
          children.intersperse(Gap(ProseMirrorWidgetDocumentData.of(context).documentParagraphSpacing * 16)).toList(),
    );

    return ProseMirrorPadded(
      child: switch (kind) {
        1 => Container(
            padding: const Pad(left: 10),
            decoration: const BoxDecoration(border: Border(left: BorderSide(color: BrandColors.gray_900, width: 3))),
            child: child,
          ),
        2 => Container(
            padding: const Pad(left: 10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SvgImage('prosemirror_widgets/blockquote_2', width: 32),
                child,
              ],
            ),
          ),
        3 => Container(
            padding: const Pad(left: 10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SvgImage('prosemirror_widgets/blockquote_2', width: 32),
                child,
                Transform.rotate(angle: pi, child: const SvgImage('prosemirror_widgets/blockquote_2', width: 32)),
              ],
            ),
          ),
        _ => const SizedBox.shrink(),
      },
    );
  }
}
