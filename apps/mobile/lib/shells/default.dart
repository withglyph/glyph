import 'package:flutter/material.dart';
import 'package:glyph/components/heading.dart';
import 'package:glyph/themes/colors.dart';

class DefaultShell extends StatelessWidget {
  const DefaultShell({
    super.key,
    this.title,
    required this.child,
    this.actions,
    this.useSafeArea = false,
  });

  final String? title;
  final Widget child;
  final List<Widget>? actions;
  final bool useSafeArea;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: BrandColors.gray_0,
      appBar: Heading(
        title: title == null
            ? null
            : Text(
                title!,
                style: const TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w700,
                ),
              ),
        actions: actions,
        backgroundColor: BrandColors.gray_0,
      ),
      body: useSafeArea ? SafeArea(child: child) : child,
    );
  }
}
