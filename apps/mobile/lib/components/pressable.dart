import 'package:flutter/material.dart';

class Pressable extends StatelessWidget {
  const Pressable({
    super.key,
    this.onPressed,
    required this.child,
  });

  final Widget child;
  final void Function()? onPressed;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: onPressed,
      child: child,
    );
  }
}
