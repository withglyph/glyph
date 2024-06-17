import 'package:flutter/material.dart';
import 'package:glyph/components/heading.dart';
import 'package:glyph/themes/colors.dart';

class DefaultShell extends StatelessWidget {
  const DefaultShell({
    required this.child,
    super.key,
    this.title,
    this.actions,
    this.useSafeArea = false,
    this.appBar,
    this.bottomBorder = true,
  });

  final PreferredSizeWidget? appBar;
  final String? title;
  final Widget child;
  final List<Widget>? actions;
  final bool useSafeArea;
  final bool bottomBorder;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: BrandColors.gray_0,
      appBar: appBar ??
          Heading(
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
            bottomBorder: bottomBorder,
          ),
      body: useSafeArea ? SafeArea(child: child) : child,
    );
  }
}
