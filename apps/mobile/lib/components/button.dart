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
      style: (style ?? const ButtonStyle()).merge(ButtonStyle(
        shape: const WidgetStatePropertyAll(LinearBorder.none),
        elevation: const WidgetStatePropertyAll(0),
        splashFactory: NoSplash.splashFactory,
        shadowColor: const WidgetStatePropertyAll(Colors.transparent),
        foregroundColor: WidgetStatePropertyAll(BrandColors.gray[0]),
        backgroundColor: WidgetStatePropertyAll(BrandColors.gray[900]),
      )),
      child: child,
    );
  }
}
