import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:glyph/env.dart';
import 'package:glyph/prosemirror/schema.dart';
import 'package:url_launcher/url_launcher.dart';

class ProseMirrorWebView extends ConsumerStatefulWidget {
  const ProseMirrorWebView({
    required this.node,
    super.key,
  });

  final ProseMirrorNode node;

  @override
  ConsumerState<ConsumerStatefulWidget> createState() => _ProseMirrorWebviewState();
}

class _ProseMirrorWebviewState extends ConsumerState<ProseMirrorWebView> {
  final GlobalKey _key = GlobalKey();

  double _height = 1;

  final _settings = InAppWebViewSettings(
    allowsBackForwardNavigationGestures: false,
    disableContextMenu: true,
    disableLongPressContextMenuOnLinks: true,
    isTextInteractionEnabled: false,
    disableHorizontalScroll: true,
    disableVerticalScroll: true,
    disallowOverScroll: true,
    supportZoom: false,
    transparentBackground: true,
  );

  final _cookieManager = CookieManager.instance();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: _height,
      child: InAppWebView(
        key: _key,
        initialSettings: _settings,
        preventGestureDelay: true,
        onWebViewCreated: (controller) async {
          final baseUri = WebUri(Env.baseUrl);

          await _cookieManager.setCookie(
            url: baseUri,
            name: 'glyph-wb',
            value: 'true',
            isSecure: Env.baseUrl.startsWith('https'),
          );

          if (!Platform.isAndroid || await WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)) {
            await controller.addWebMessageListener(
              WebMessageListener(
                jsObjectName: 'flutter',
                allowedOriginRules: {'*'},
                onPostMessage: (message, sourceOrigin, isMainFrame, replyProxy) async {
                  if (!mounted) {
                    return;
                  }

                  final data = json.decode(utf8.decode(base64.decode(message!.data)));
                  if (data['type'] == 'resize') {
                    setState(() {
                      _height = (data['height'] as num).toDouble();
                    });

                    return;
                  }
                },
              ),
            );
          }

          unawaited(
            controller.loadUrl(
              urlRequest: URLRequest(
                url: WebUri('${Env.baseUrl}/_webview/prosemirror-renderer'),
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: utf8.encode('node=${Uri.encodeQueryComponent(json.encode(widget.node.toJson()))}'),
              ),
            ),
          );
        },
        shouldOverrideUrlLoading: (controller, navigationAction) async {
          if (navigationAction.navigationType == NavigationType.LINK_ACTIVATED) {
            unawaited(
              () async {
                try {
                  await launchUrl(
                    navigationAction.request.url!.uriValue,
                    mode: LaunchMode.inAppBrowserView,
                  );
                } on Exception {
                  // ignore
                }
              }(),
            );

            return NavigationActionPolicy.CANCEL;
          }

          return NavigationActionPolicy.ALLOW;
        },
      ),
    );
  }
}
