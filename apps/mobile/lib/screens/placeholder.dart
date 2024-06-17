import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:glyph/shells/default.dart';

@RoutePage()
class PlaceholderScreen extends ConsumerWidget {
  const PlaceholderScreen({required this.text, super.key});

  final String text;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return DefaultShell(
      title: text,
      child: const Center(child: Text('곧 업데이트 될 예정이에요!')),
    );
  }
}
