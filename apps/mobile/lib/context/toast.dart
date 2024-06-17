import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:glyph/themes/colors.dart';

class TextToastWidget extends ConsumerWidget {
  const TextToastWidget({required this.message, super.key});

  final String message;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: BrandColors.gray_900,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        message,
        style: const TextStyle(
          color: BrandColors.gray_0,
          fontSize: 15,
        ),
      ),
    );
  }
}

class ToastScope extends ConsumerStatefulWidget {
  const ToastScope({required this.child, super.key});

  final Widget child;

  static ToastScopeState? of(BuildContext context) {
    return context.findAncestorStateOfType<ToastScopeState>();
  }

  @override
  ConsumerState<ToastScope> createState() => ToastScopeState();
}

class ToastScopeState extends ConsumerState<ToastScope> {
  final ftoast = FToast();

  @override
  void initState() {
    super.initState();

    ftoast.init(context);
  }

  @override
  Widget build(BuildContext context) {
    return widget.child;
  }
}

class ToastController {
  const ToastController(this.context);

  final BuildContext context;
  FToast get _ftoast => ToastScope.of(context)!.ftoast;

  void show(String message) {
    _ftoast.showToast(
      child: TextToastWidget(message: message),
      positionedToastBuilder: (context, child) {
        final height = MediaQuery.of(context).padding.bottom;
        return Positioned(
          bottom: height + 28,
          left: 16,
          right: 16,
          child: child,
        );
      },
    );
  }
}

extension ToastScopeX on BuildContext {
  ToastController get toast => ToastController(this);
}
