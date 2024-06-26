import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:glyph/components/heading.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/components/webview.dart';
import 'package:glyph/routers/app.gr.dart';

@RoutePage()
class EditorScreen extends StatefulWidget {
  const EditorScreen({@PathParam() required this.permalink, super.key});

  final String permalink;

  @override
  createState() => _EditorScreenState();
}

class _EditorScreenState extends State<EditorScreen> {
  Future<void> Function(dynamic data)? reply;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: Heading(
        title: const Text(
          '포스트 작성',
          style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700),
        ),
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
      ),
      body: WebView(
        path: '/editor/${widget.permalink}',
        readOnly: false,
        onJsMessage: (data, reply) async {
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
