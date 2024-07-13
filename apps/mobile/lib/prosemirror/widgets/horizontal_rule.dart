import 'dart:math';

import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:flutter/material.dart';
import 'package:glyph/components/svg_image.dart';
import 'package:glyph/prosemirror/schema.dart';
import 'package:glyph/prosemirror/special/padded.dart';
import 'package:glyph/themes/colors.dart';

class ProseMirrorWidgetHorizontalRule extends StatelessWidget {
  const ProseMirrorWidgetHorizontalRule({
    required this.kind,
    super.key,
  });

  factory ProseMirrorWidgetHorizontalRule.node(ProseMirrorNode node) {
    return ProseMirrorWidgetHorizontalRule(
      kind: (node.attrs?['kind'] as int?) ?? 1,
    );
  }

  final int kind;

  @override
  Widget build(BuildContext context) {
    return ProseMirrorPadded(
      child: switch (kind) {
        1 => CustomPaint(painter: _Kind1Painter()),
        2 => const Box(width: double.infinity, height: 1, color: BrandColors.gray_400),
        3 => const Center(child: Box(width: 120, height: 1, color: BrandColors.gray_400)),
        4 => const SvgImage('prosemirror_widgets/horizontal_rule_4', height: 28),
        5 => const SvgImage('prosemirror_widgets/horizontal_rule_5', height: 14),
        6 => const SvgImage('prosemirror_widgets/horizontal_rule_6', height: 15),
        7 => const SvgImage('prosemirror_widgets/horizontal_rule_7', height: 20),
        8 => const SvgImage('prosemirror_widgets/horizontal_rule_8', height: 12),
        _ => const SizedBox.shrink(),
      },
    );
  }
}

class _Kind1Painter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFF27272A)
      ..strokeWidth = 1
      ..strokeCap = StrokeCap.round;

    var x = 0.0;
    while (x < size.width) {
      canvas.drawLine(Offset(x, 0), Offset(min(x + 8, size.width), 0), paint);
      x += 16;
    }
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}
