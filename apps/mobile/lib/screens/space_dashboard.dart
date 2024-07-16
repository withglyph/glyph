import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:glyph/components/webview.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/shells/default.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:url_launcher/url_launcher.dart';

@RoutePage()
class SpaceDashboardScreen extends StatefulWidget {
  const SpaceDashboardScreen({@PathParam() required this.slug, super.key});

  final String slug;

  @override
  createState() => _SpaceDashboardScreenState();
}

class _SpaceDashboardScreenState extends State<SpaceDashboardScreen> {
  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await Permission.photos.request();
    });
  }

  @override
  Widget build(BuildContext context) {
    return DefaultShell(
      title: '스페이스 관리',
      useSafeArea: true,
      child: WebView(
        path: '/${widget.slug}/dashboard/settings',
        onJsMessage: (data, reply, controller) async {
          if (data['type'] == 'post:view') {
            await context.router.push(
              PostRoute(permalink: data['permalink']),
            );
          } else if (data['type'] == 'post:edit') {
            await context.router.push(
              EditorRoute(permalink: data['permalink']),
            );
          } else if (data['type'] == 'space:delete') {
            await context.router.maybePop('space:delete');
          } else if (data['type'] == 'redeem:download') {
            await launchUrl(
              Uri.parse(data['href']),
              mode: LaunchMode.inAppBrowserView,
            );
          }
        },
      ),
    );
  }
}
