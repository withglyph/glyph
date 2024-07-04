import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/btn.dart';
import 'package:glyph/components/empty_state.dart';
import 'package:glyph/icons/tabler.dart';
import 'package:glyph/routers/app.gr.dart';

class AppErrorWidget extends StatelessWidget {
  const AppErrorWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const EmptyState(
            icon: Tabler.alert_triangle,
            title: '앗! 오류가 발생했어요',
            description: '잠시 후 다시 시도해주세요.',
          ),
          const Gap(20),
          Padding(
            padding: const Pad(horizontal: 50),
            child: Btn(
              '글리프 홈으로 가기',
              onPressed: () async {
                await context.router.replace(const MeRoute());
              },
            ),
          ),
        ],
      ),
    );
  }
}
