import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:glyph/providers/auth.dart';

class WebViewScreen extends ConsumerStatefulWidget {
  const WebViewScreen({super.key});

  @override
  ConsumerState<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends ConsumerState<WebViewScreen> {
  final GlobalKey webViewKey = GlobalKey();

  late InAppWebViewController webViewController;
  final settings = InAppWebViewSettings();
  final cookieManager = CookieManager.instance();

  final url = WebUri('https://withglyph.com');

  @override
  Widget build(BuildContext context) {
    final authValue = ref.watch(authProvider);
    final accessToken = switch (authValue) {
      AsyncData(value: Authenticated(:final accessToken)) => accessToken,
      _ => null,
    };

    return Container(
      color: Colors.white,
      child: SafeArea(
        bottom: false,
        child: InAppWebView(
          key: webViewKey,
          initialSettings: settings,
          onWebViewCreated: (controller) async {
            webViewController = controller;

            await cookieManager.setCookie(
              url: url,
              name: 'glyph-at',
              value: accessToken!,
              isSecure: true,
            );

            webViewController.loadUrl(urlRequest: URLRequest(url: url));
          },
        ),
      ),
    );
  }
}
