import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:glyph/providers/auth.dart';

const _baseUrl = 'https://dev.withglyph.com';
// const _baseUrl = 'http://localhost:4000';

class WebView extends ConsumerStatefulWidget {
  const WebView({
    super.key,
    required this.path,
    this.onJsMessage,
    this.onNavigate,
  });

  final String path;
  final Future<void> Function(
      dynamic data, Future<void> Function(dynamic data) reply)? onJsMessage;
  final Future<NavigationActionPolicy?> Function(
          InAppWebViewController controller, NavigationAction navigationAction)?
      onNavigate;

  @override
  ConsumerState<ConsumerStatefulWidget> createState() => _WebviewState();
}

class _WebviewState extends ConsumerState<WebView> {
  final GlobalKey _key = GlobalKey();

  // late InAppWebViewController _webViewController;
  final _settings = InAppWebViewSettings();
  final _cookieManager = CookieManager.instance();

  @override
  Widget build(BuildContext context) {
    final authValue = ref.watch(authProvider);
    final accessToken = switch (authValue) {
      AsyncData(value: Authenticated(:final accessToken)) => accessToken,
      _ => null,
    };

    return InAppWebView(
      key: _key,
      initialSettings: _settings,
      onWebViewCreated: (controller) async {
        // _webViewController = controller;

        await _cookieManager.setCookie(
          url: WebUri(_baseUrl),
          name: 'glyph-at',
          value: accessToken!,
          isSecure: _baseUrl.startsWith('https'),
        );

        if (defaultTargetPlatform != TargetPlatform.android ||
            await WebViewFeature.isFeatureSupported(
                WebViewFeature.WEB_MESSAGE_LISTENER)) {
          await controller.addWebMessageListener(WebMessageListener(
            jsObjectName: 'flutter',
            allowedOriginRules: {'*'},
            onPostMessage:
                (message, sourceOrigin, isMainFrame, replyProxy) async {
              await widget.onJsMessage?.call(
                json.decode(utf8.decode(base64.decode(message!.data))),
                (data) async => await replyProxy.postMessage(
                  WebMessage(
                    data: base64.encode(utf8.encode(json.encode(data))),
                  ),
                ),
              );
            },
          ));
        }

        controller.loadUrl(
          urlRequest: URLRequest(
            url: WebUri('$_baseUrl${widget.path}'),
          ),
        );
      },
      shouldOverrideUrlLoading: widget.onNavigate,
    );
  }
}
