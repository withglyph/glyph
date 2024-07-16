import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/components/webview.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/shells/default.dart';
import 'package:permission_handler/permission_handler.dart';

@RoutePage()
class EditorScreen extends StatefulWidget {
  const EditorScreen({
    @PathParam() required this.permalink,
    super.key,
  });

  final String permalink;

  @override
  createState() => _EditorScreenState();
}

class _EditorScreenState extends State<EditorScreen> {
  Future<void> Function(dynamic data)? reply;

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
      title: '포스트 작성',
      useSafeArea: true,
      actions: [
        Pressable(
          child: const Text(
            '발행',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
          onPressed: () async {
            await reply?.call({'type': 'publish:open'});
          },
        ),
      ],
      child: WebView(
        path: '/editor/${widget.permalink}',
        onJsMessage: (data, reply, controller) async {
          this.reply ??= reply;

          if (data['type'] == 'publish:done') {
            await context.router.replace(
              PostRoute(permalink: data['permalink']),
            );
          }
        },
      ),
    );
  }
}
