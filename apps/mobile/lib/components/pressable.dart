import 'package:datadog_flutter_plugin/datadog_flutter_plugin.dart';
import 'package:flutter/material.dart';

class Pressable extends StatelessWidget {
  const Pressable({
    required this.child,
    this.label,
    super.key,
    this.onPressed,
  });

  final Widget child;
  final String? label;
  final void Function()? onPressed;

  @override
  Widget build(BuildContext context) {
    final widget = GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: onPressed,
      child: child,
    );

    if (label == null) {
      return widget;
    } else {
      return RumUserActionAnnotation(
        description: label!,
        child: widget,
      );
    }
  }
}
