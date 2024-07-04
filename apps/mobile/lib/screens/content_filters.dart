import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:glyph/components/heading.dart';
import 'package:glyph/components/webview.dart';
import 'package:glyph/routers/app.gr.dart';

@RoutePage()
class ContentFiltersScreen extends ConsumerWidget {
  const ContentFiltersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: const Heading(
        title: Text(
          '컨텐츠 필터링',
          style: TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
      body: WebView(
        path: '/me/contentfilters',
        onJsMessage: (data, reply, controller) async {
          if (data['type'] == 'space:view') {
            await context.router.push(
              SpaceRoute(slug: data['slug']),
            );
          } else if (data['type'] == 'tag:view') {
            await context.router.push(
              TagRoute(name: data['name']),
            );
          }
        },
      ),
    );
  }
}
