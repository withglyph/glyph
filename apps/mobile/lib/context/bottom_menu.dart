import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/context/bottom_sheet.dart';
import 'package:glyph/icons/tabler_bold.dart';
import 'package:glyph/themes/colors.dart';

extension BottomMenuX on BuildContext {
  Future<void> showBottomMenu<T>({
    required String title,
    required List<BottomMenuItem> items,
  }) async {
    await showFloatingBottomSheet(
      builder: (context) {
        return _BottomMenu(
          title: title,
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
      builder: (context) {
        return _BottomSelectMenu(
          title: title,
          value: value,
          items: items,
          onSelected: onSelected,
        );
      },
    );
  }
}

class BottomMenuItem {
  BottomMenuItem({
    required this.icon,
    required this.title,
    required this.onTap,
    this.color,
    this.iconColor,
  });

  final IconData icon;
  final String title;
  final Color? color;
  final Color? iconColor;
  final void Function() onTap;
}

class _BottomMenu extends StatelessWidget {
  const _BottomMenu({
    required this.title,
    required this.items,
  });

  final String title;
  final List<BottomMenuItem> items;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Gap(8),
        Text(
          title,
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w700,
          ),
        ),
        const Gap(10),
        ...items.map((item) {
          return Pressable(
            child: Padding(
              padding: const EdgeInsets.symmetric(
                vertical: 16,
              ),
              child: Row(
                children: [
                  Container(
                    width: 22,
                    height: 22,
                    decoration: const BoxDecoration(
                      color: BrandColors.gray_50,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      item.icon,
                      size: 12,
                      color: item.iconColor ?? item.color,
                    ),
                  ),
                  const Gap(14),
                  Text(
                    item.title,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: item.color,
                    ),
                  ),
                ],
              ),
            ),
            onPressed: () async {
              await context.router.maybePop();
              item.onTap();
            },
          );
        }),
      ],
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
    required this.title,
    required this.value,
    required this.items,
    required this.onSelected,
  });

  final String title;
  final T value;
  final List<BottomSelectMenuItem<T>> items;
  final Function(T value) onSelected;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Gap(8),
        Text(
          title,
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w700,
          ),
        ),
        const Gap(10),
        ...items.map((item) {
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
        }),
      ],
    );
  }
}
