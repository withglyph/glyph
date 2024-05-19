import 'package:flutter/material.dart';

import '../themes/colors.dart';

class Button extends StatelessWidget {
  final Widget child;
  final ButtonStyle? style;
  final void Function()? onPressed;

  const Button({
    super.key,
    this.style,
    this.onPressed,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: onPressed,
      style: (style ?? const ButtonStyle()).merge(const ButtonStyle(
        shape: WidgetStatePropertyAll(LinearBorder.none),
        elevation: WidgetStatePropertyAll(0),
        splashFactory: NoSplash.splashFactory,
        shadowColor: WidgetStatePropertyAll(Colors.transparent),
        foregroundColor: WidgetStatePropertyAll(BrandColors.gray_0),
        backgroundColor: WidgetStatePropertyAll(BrandColors.gray_900),
      )),
      child: child,
    );
  }
}
