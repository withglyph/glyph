import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/components/svg_icon.dart';
import 'package:glyph/context/bottom_sheet.dart';

extension BottomMenuX on BuildContext {
  Future<T> showBottomMenu<T>({required List<BottomMenuItem> items}) async {
    return this.showBottomSheet(
      builder: (context) {
        return _BottomMenu(
          items: items,
        );
      },
    );
  }
}

class BottomMenuItem {
  final String icon;
  final String title;
  final Color? color;
  final void Function() onTap;

  BottomMenuItem({
    required this.icon,
    required this.title,
    this.color,
    required this.onTap,
  });
}

class _BottomMenu extends StatelessWidget {
  const _BottomMenu({required this.items});

  final List<BottomMenuItem> items;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: items.map((item) {
          return Pressable(
            child: Container(
              padding: const EdgeInsets.symmetric(
                horizontal: 10,
                vertical: 14,
              ),
              child: Row(
                children: [
                  SvgIcon(item.icon, size: 16, color: item.color),
                  const Gap(16),
                  Text(
                    item.title,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                      color: item.color,
                    ),
                  ),
                ],
              ),
            ),
            onPressed: () {
              context.router.maybePop();
              item.onTap();
            },
          );
        }).toList(),
      ),
    );
  }
}
