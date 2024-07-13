import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:flutter/material.dart';

class ProseMirrorPadded extends StatelessWidget {
  const ProseMirrorPadded({
    required this.child,
    super.key,
  });

  final Widget child;

  @override
  Widget build(BuildContext context) {
    if (ProseMirrorPaddedData.maybeOf(context) != null) {
      return child;
    }

    return Padding(
      padding: const Pad(horizontal: 20),
      child: ProseMirrorPaddedData(
        child: child,
      ),
    );
  }
}

class ProseMirrorPaddedData extends InheritedWidget {
  const ProseMirrorPaddedData({
    required super.child,
    super.key,
  });

  static ProseMirrorPaddedData? maybeOf(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<ProseMirrorPaddedData>();
  }

  @override
  bool updateShouldNotify(ProseMirrorPaddedData oldWidget) {
    return false;
  }
}
