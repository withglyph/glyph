import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:get_it/get_it.dart';
import 'package:glyph/env.dart';
import 'package:glyph/providers/auth.dart';

class WebView extends ConsumerStatefulWidget {
  const WebView({
    required this.path,
    super.key,
    this.readOnly = false,
    this.onJsMessage,
    this.onNavigate,
  });

  final String path;
  final bool readOnly;
  final Future<void> Function(
    dynamic data,
    Future<void> Function(dynamic data) reply,
    InAppWebViewController controller,
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

  final _storage = GetIt.I<FlutterSecureStorage>();
  final _deviceIdStorageKey = 'webview_device_id';

  // InAppWebViewController? _webViewController;
  InAppWebViewSettings get _settings => InAppWebViewSettings(
        allowsBackForwardNavigationGestures: false,
        disableContextMenu: true,
        disableLongPressContextMenuOnLinks: true,
        isTextInteractionEnabled: !widget.readOnly,
        disableHorizontalScroll: widget.readOnly,
        disableVerticalScroll: widget.readOnly,
        disallowOverScroll: widget.readOnly,
        supportZoom: false,
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
        final baseUri = WebUri(Env.baseUrl);
        final deviceId = await _storage.read(key: _deviceIdStorageKey);

        if (deviceId != null) {
          await _cookieManager.setCookie(
            url: baseUri,
            name: 'glyph-did',
            value: deviceId,
            isSecure: Env.baseUrl.startsWith('https'),
            isHttpOnly: true,
          );
        }

        await _cookieManager.setCookie(
          url: baseUri,
          name: 'glyph-at',
          value: accessToken!,
          isSecure: Env.baseUrl.startsWith('https'),
          isHttpOnly: true,
        );

        await _cookieManager.setCookie(
          url: baseUri,
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
              onPostMessage: (message, sourceOrigin, isMainFrame, replyProxy) async {
                await widget.onJsMessage?.call(
                  json.decode(utf8.decode(base64.decode(message!.data))),
                  (data) => replyProxy.postMessage(
                    WebMessage(
                      data: base64.encode(utf8.encode(json.encode(data))),
                    ),
                  ),
                  controller,
                );
              },
            ),
          );
        }

        await controller.loadUrl(
          urlRequest: URLRequest(
            url: WebUri('${Env.baseUrl}${widget.path}'),
          ),
        );

        final deviceIdCookie = await _cookieManager.getCookie(url: baseUri, name: 'glyph-did');
        if (deviceIdCookie != null) {
          await _storage.write(key: _deviceIdStorageKey, value: deviceIdCookie.value);
        }
      },
      shouldOverrideUrlLoading: widget.onNavigate,
    );
  }
}
