import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

@RoutePage()
class SpaceCollectionsScreen extends ConsumerWidget {
  const SpaceCollectionsScreen({required this.slug, super.key});

  final String slug;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return const Text('스페이스 컬렉션');
  }
}
