import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:glyph/themes/colors.dart';

class AppErrorWidget extends StatelessWidget {
  const AppErrorWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              '오류!!!',
              style: TextStyle(
                fontSize: 72,
                fontWeight: FontWeight.w900,
              ),
            ),
            const Gap(16),
            GestureDetector(
              child: const Box(
                color: BrandColors.gray_900,
                padding: Pad(horizontal: 16, vertical: 8),
                child: Text(
                  '뒤로 가기',
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: BrandColors.gray_0,
                  ),
                ),
              ),
              onTap: () async {
                await context.router.maybePop();
              },
            ),
          ],
        ),
      ),
    );
  }
}
