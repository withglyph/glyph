import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:flutter/material.dart';

enum RectangleChipTheme {
  grass,
  blue,
  pink,
  purple,
}

class RectangleChip extends StatelessWidget {
  const RectangleChip(
    this.title, {
    super.key,
    this.theme = RectangleChipTheme.grass,
  });

  final String title;
  final RectangleChipTheme theme;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const Pad(horizontal: 4, vertical: 1.5),
      decoration: BoxDecoration(
        color: switch (theme) {
          RectangleChipTheme.grass => const Color(0xFF3CA397).withOpacity(0.12),
          RectangleChipTheme.blue => const Color(0xFF5D74C1).withOpacity(0.12),
          RectangleChipTheme.pink => const Color(0xFFEC53B2).withOpacity(0.12),
          RectangleChipTheme.purple => const Color(0xFF613994).withOpacity(0.12),
        },
        borderRadius: const BorderRadius.all(Radius.circular(2)),
      ),
      child: Text(
        title,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: switch (theme) {
            RectangleChipTheme.grass => const Color(0xFF3CA397),
            RectangleChipTheme.blue => const Color(0xFF5D74C1),
            RectangleChipTheme.pink => const Color(0xFFEC53B2),
            RectangleChipTheme.purple => const Color(0xFF613994),
          },
        ),
      ),
    );
  }
}
