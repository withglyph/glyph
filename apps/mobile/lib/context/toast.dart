import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/icons/tabler.dart';
import 'package:glyph/themes/colors.dart';

enum ToastType {
  success,
  error,
}

class _TextToastWidget extends ConsumerWidget {
  const _TextToastWidget({
    required this.type,
    required this.message,
    this.actionText,
    this.onAction,
  });

  final ToastType type;
  final String message;
  final String? actionText;
  final Function()? onAction;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      padding: const Pad(all: 14),
      decoration: BoxDecoration(
        color: BrandColors.gray_600,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const Pad(top: 2),
            child: switch (type) {
              ToastType.success => const Icon(
                  Tabler.circle_check_filled,
                  color: Color(0xFF2DB362),
                  size: 16,
                ),
              ToastType.error => const Icon(
                  Tabler.alert_circle_filled,
                  color: Color(0xFFFFC750),
                  size: 16,
                ),
            },
          ),
          const Gap(6),
          Expanded(
            child: Text(
              message,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: BrandColors.gray_0,
              ),
            ),
          ),
          if (actionText != null) ...[
            const Gap(16),
            Pressable(
              onPressed: onAction,
              child: Text(
                actionText!,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: BrandColors.gray_0,
                ),
              ),
            ),
          ],
        ],
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

  void show(String message, {ToastType type = ToastType.success, String? actionText, Function()? onAction}) {
    _ftoast.showToast(
      child: _TextToastWidget(
        type: type,
        message: message,
        actionText: actionText,
        onAction: () {
          _ftoast.removeCustomToast();
          onAction?.call();
        },
      ),
      positionedToastBuilder: (context, child) {
        final height = MediaQuery.of(context).padding.bottom;
        final inset = MediaQuery.of(context).viewInsets.bottom;
        return Positioned(
          bottom: height + inset + 12,
          left: 20,
          right: 20,
          child: child,
        );
      },
    );
  }
}

extension ToastScopeX on BuildContext {
  ToastController get toast => ToastController(this);
}
