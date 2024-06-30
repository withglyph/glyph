import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/icons/tabler_bold.dart';
import 'package:glyph/themes/colors.dart';

extension BottomMenuX on BuildContext {
  Future<void> showBottomMenu<T>({
    required String title,
    required List<RawBottomMenuItem> items,
  }) async {
    await _showFloatingBottomSheet(
      context: this,
      title: title,
      builder: (context) {
        return _BottomMenu(
          items: items,
        );
      },
    );
  }

  Future<void> showBottomSelectMenu<T>({
    required String title,
    required T value,
    required List<BottomSelectMenuItem<T>> items,
    required Function(T value) onSelected,
  }) async {
    await _showFloatingBottomSheet(
      context: this,
      title: title,
      builder: (context) {
        return _BottomSelectMenu(
          value: value,
          items: items,
          onSelected: onSelected,
        );
      },
    );
  }
}

class RawBottomMenuItem {
  RawBottomMenuItem({
    required this.child,
    required this.onTap,
  });

  final Widget child;
  final void Function() onTap;
}

class BottomMenuItem extends RawBottomMenuItem {
  BottomMenuItem({
    required IconData icon,
    required String title,
    required super.onTap,
    Color? color,
    Color? iconColor,
  }) : super(
          child: Row(
            children: [
              Container(
                width: 22,
                height: 22,
                decoration: const BoxDecoration(
                  color: BrandColors.gray_50,
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, size: 12, color: iconColor ?? color),
              ),
              const Gap(14),
              Text(
                title,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: color,
                ),
              ),
            ],
          ),
        );
}

class _BottomMenu extends StatelessWidget {
  const _BottomMenu({
    required this.items,
  });

  final List<RawBottomMenuItem> items;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: items.map((item) {
        return Pressable(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 16),
            child: item.child,
          ),
          onPressed: () async {
            await context.router.maybePop();
            item.onTap();
          },
        );
      }).toList(),
    );
  }
}

class BottomSelectMenuItem<T> {
  BottomSelectMenuItem({
    required this.label,
    required this.value,
  });

  final String label;
  final T value;
}

class _BottomSelectMenu<T> extends StatelessWidget {
  const _BottomSelectMenu({
    required this.value,
    required this.items,
    required this.onSelected,
  });

  final T value;
  final List<BottomSelectMenuItem<T>> items;
  final Function(T value) onSelected;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: items.map((item) {
        return Pressable(
          child: Padding(
            padding: const EdgeInsets.symmetric(
              vertical: 16,
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    item.label,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: BrandColors.gray_600,
                    ),
                  ),
                ),
                if (value == item.value)
                  const Icon(
                    TablerBold.check,
                    size: 20,
                    color: BrandColors.brand_400,
                  ),
              ],
            ),
          ),
          onPressed: () async {
            await context.router.maybePop();
            onSelected(item.value);
          },
        );
      }).toList(),
    );
  }
}

Future<T> _showFloatingBottomSheet<T>({
  required BuildContext context,
  required String title,
  required WidgetBuilder builder,
}) async {
  return await showModalBottomSheet(
    context: context,
    backgroundColor: Colors.transparent,
    elevation: 0,
    isScrollControlled: true,
    useSafeArea: true,
    shape: LinearBorder.none,
    constraints: const BoxConstraints(maxHeight: 400),
    builder: (context) {
      final child = builder(context);

      return SafeArea(
        child: Container(
          margin: const EdgeInsets.fromLTRB(10, 0, 10, 0),
          padding: const EdgeInsets.fromLTRB(24, 8, 24, 20),
          decoration: BoxDecoration(
            color: BrandColors.gray_0,
            borderRadius: BorderRadius.circular(22),
            boxShadow: [
              BoxShadow(
                color: BrandColors.gray_900.withOpacity(0.2),
                offset: const Offset(2, 3),
                blurRadius: 20,
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: BrandColors.gray_150,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const Gap(24),
              Text(
                title,
                textAlign: TextAlign.left,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const Gap(10),
              Flexible(
                child: SingleChildScrollView(
                  child: child,
                ),
              ),
            ],
          ),
        ),
      );
    },
  );
}
