import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:glyph/env.dart';
import 'package:glyph/providers/auth.dart';

class WebView extends ConsumerStatefulWidget {
  const WebView({
    required this.path,
    super.key,
    this.fitToContent = false,
    this.readOnly = true,
    this.onJsMessage,
    this.onNavigate,
  });

  final String path;
  final bool fitToContent;
  final bool readOnly;
  final Future<void> Function(
    dynamic data,
    Future<void> Function(dynamic data) reply,
  )? onJsMessage;
  final Future<NavigationActionPolicy?> Function(
    InAppWebViewController controller,
    NavigationAction navigationAction,
  )? onNavigate;

  @override
  ConsumerState<ConsumerStatefulWidget> createState() => _WebviewState();
}

class _WebviewState extends ConsumerState<WebView> {
  final GlobalKey _key = GlobalKey();

  // InAppWebViewController? _webViewController;
  InAppWebViewSettings get _settings => InAppWebViewSettings(
        allowsBackForwardNavigationGestures: false,
        disableContextMenu: true,
        disableLongPressContextMenuOnLinks: true,
        isTextInteractionEnabled: !widget.readOnly,
        supportZoom: false,
        suppressesIncrementalRendering: true,
      );

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
      preventGestureDelay: true,
      onWebViewCreated: (controller) async {
        // _webViewController = controller;

        await _cookieManager.setCookie(
          url: WebUri(Env.baseUrl),
          name: 'glyph-at',
          value: accessToken!,
          isSecure: Env.baseUrl.startsWith('https'),
          isHttpOnly: true,
        );

        await _cookieManager.setCookie(
          url: WebUri(Env.baseUrl),
          name: 'glyph-wb',
          value: 'true',
          isSecure: Env.baseUrl.startsWith('https'),
        );

        if (defaultTargetPlatform != TargetPlatform.android ||
            await WebViewFeature.isFeatureSupported(
              WebViewFeature.WEB_MESSAGE_LISTENER,
            )) {
          await controller.addWebMessageListener(
            WebMessageListener(
              jsObjectName: 'flutter',
              allowedOriginRules: {'*'},
              onPostMessage:
                  (message, sourceOrigin, isMainFrame, replyProxy) async {
                await widget.onJsMessage?.call(
                  json.decode(utf8.decode(base64.decode(message!.data))),
                  (data) => replyProxy.postMessage(
                    WebMessage(
                      data: base64.encode(utf8.encode(json.encode(data))),
                    ),
                  ),
                );
              },
            ),
          );
        }

        unawaited(
          controller.loadUrl(
            urlRequest: URLRequest(
              url: WebUri('${Env.baseUrl}${widget.path}'),
            ),
          ),
        );
      },
      shouldOverrideUrlLoading: widget.onNavigate,
    );
  }
}
