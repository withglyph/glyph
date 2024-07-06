import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/context/floating_bottom_sheet.dart';
import 'package:glyph/icons/tabler_bold.dart';
import 'package:glyph/themes/colors.dart';

extension BottomMenuX on BuildContext {
  Future<void> showBottomMenu<T>({
    required String title,
    required List<RawBottomMenuItem> items,
  }) async {
    await showFloatingBottomSheet(
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
    await showFloatingBottomSheet(
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
            padding: const Pad(vertical: 16),
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
            padding: const Pad(vertical: 16),
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
