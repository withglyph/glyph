import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/button.dart';

@RoutePage()
class PlaceholderScreen extends ConsumerWidget {
  const PlaceholderScreen({super.key, required this.text});

  final String text;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(text),
            const Gap(12),
            Button(
              child: const Text('돌아가기'),
              onPressed: () {
                context.router.maybePop();
              },
            ),
          ],
        ),
      ),
    );
  }
}
