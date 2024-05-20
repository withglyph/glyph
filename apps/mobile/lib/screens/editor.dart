import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:glyph/providers/auth.dart';
import 'package:glyph/themes/colors.dart';

@RoutePage()
class EditorScreen extends ConsumerStatefulWidget {
  const EditorScreen({super.key, required this.permalink});

  final String permalink;

  @override
  ConsumerState<EditorScreen> createState() => _EditorScreenState();
}

class _EditorScreenState extends ConsumerState<EditorScreen> {
  final GlobalKey webViewKey = GlobalKey();

  late InAppWebViewController webViewController;
  final settings = InAppWebViewSettings();
  final cookieManager = CookieManager.instance();

  @override
  Widget build(BuildContext context) {
    final authValue = ref.watch(authProvider);
    final accessToken = switch (authValue) {
      AsyncData(value: Authenticated(:final accessToken)) => accessToken,
      _ => null,
    };

    return Container(
      color: BrandColors.gray_0,
      child: SafeArea(
        child: InAppWebView(
          key: webViewKey,
          initialSettings: settings,
          onWebViewCreated: (controller) async {
            webViewController = controller;

            controller.addJavaScriptHandler(
              handlerName: 'close',
              callback: (_) {
                context.router.maybePop();
              },
            );

            await cookieManager.setCookie(
              url: WebUri('https://dev.withglyph.com'),
              name: 'glyph-at',
              value: accessToken!,
              isSecure: true,
            );

            controller.loadUrl(
              urlRequest: URLRequest(
                url: WebUri(
                  'https://dev.withglyph.com/editor/${widget.permalink}?webview=true',
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
