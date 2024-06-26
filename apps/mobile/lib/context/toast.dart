import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:glyph/icons/tabler.dart';
import 'package:glyph/themes/colors.dart';

enum ToastType {
  Success,
  Error,
}

const ToastIcon = {
  ToastType.Success: Icon(
    Tabler.circle_check_filled,
    color: Color(0xFF2DB362),
    size: 16,
  ),
  ToastType.Error: Icon(
    Tabler.alert_circle_filled,
    color: Color(0xFFFFC750),
    size: 16,
  ),
};

class TextToastWidget extends ConsumerWidget {
  const TextToastWidget({required this.message, required this.type, super.key});

  final String message;
  final ToastType type;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: BrandColors.gray_600,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Row(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 2),
            child: ToastIcon[type]!,
          ),
          const SizedBox(width: 6),
          Expanded(
            child: Text(
              message,
              style: const TextStyle(
                color: BrandColors.gray_0,
                fontSize: 14,
              ),
              softWrap: true,
            ),
          ),
        ],
        crossAxisAlignment: CrossAxisAlignment.start,
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

  void show(String message, {ToastType type = ToastType.Success}) {
    _ftoast.showToast(
      child: TextToastWidget(message: message, type: type),
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
