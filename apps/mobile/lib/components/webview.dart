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

  InAppWebViewController? _webViewController;
  InAppWebViewSettings get _settings => InAppWebViewSettings(
        allowsBackForwardNavigationGestures: false,
        disableContextMenu: true,
        disableLongPressContextMenuOnLinks: true,
        disableHorizontalScroll: widget.fitToContent,
        disableVerticalScroll: widget.fitToContent,
        disallowOverScroll: widget.fitToContent,
        isTextInteractionEnabled: !widget.readOnly,
        supportZoom: false,
        suppressesIncrementalRendering: true,
      );

  final _cookieManager = CookieManager.instance();

  double _height = 0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();

    if (widget.fitToContent) {
      _timer = Timer.periodic(const Duration(milliseconds: 500), (_) async {
        if (mounted && _webViewController != null) {
          final height =
              (await _webViewController!.getContentHeight())?.toDouble();
          if (mounted && height != null && height != _height) {
            setState(() {
              _height = height;
            });
          }
        }
      });
    }
  }

  @override
  void dispose() {
    _timer?.cancel();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authValue = ref.watch(authProvider);
    final accessToken = switch (authValue) {
      AsyncData(value: Authenticated(:final accessToken)) => accessToken,
      _ => null,
    };

    final child = InAppWebView(
      key: _key,
      initialSettings: _settings,
      preventGestureDelay: true,
      onWebViewCreated: (controller) async {
        _webViewController = controller;

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
              url: WebUri('${Env.baseUrl}${widget.path}?webview=true'),
            ),
          ),
        );
      },
      shouldOverrideUrlLoading: widget.onNavigate,
    );

    return widget.fitToContent
        ? SizedBox(height: _height, child: child)
        : child;
  }
}
