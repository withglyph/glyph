import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:glyph/components/webview.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/shells/default.dart';

@RoutePage()
class SpaceDashboardScreen extends StatelessWidget {
  const SpaceDashboardScreen({@PathParam() required this.slug, super.key});

  final String slug;

  @override
  Widget build(BuildContext context) {
    return DefaultShell(
      title: '스페이스 관리',
      child: WebView(
        path: '/$slug/dashboard/settings',
        onJsMessage: (data, reply, controller) async {
          if (data['type'] == 'post:view') {
            await context.router.push(
              PostRoute(permalink: data['permalink']),
            );
          } else if (data['type'] == 'space:delete') {
            await context.router.navigate(const MainRouter());
          }
        },
      ),
    );
  }
}
