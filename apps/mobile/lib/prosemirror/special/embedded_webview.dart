import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:glyph/env.dart';
import 'package:url_launcher/url_launcher.dart';

const _htmlTemplate = '''
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      body {
        margin: 0;
        padding: 0;
      }
    </style>
  </head>
  <body>
    <div id="content">__CODE__</div>
    <script>
      window.addEventListener('flutterInAppWebViewPlatformReady', function (event) {
        var observer = new ResizeObserver(function (entries) {
          entries.forEach(function (entry) {
            window.flutter_inappwebview.callHandler('setHeight', entry.contentRect.height);
          });
        });

        observer.observe(document.body);
      });
    </script>
  </body>
</html>
''';

class ProseMirrorEmbeddedWebView extends StatefulWidget {
  const ProseMirrorEmbeddedWebView({
    required this.html,
    super.key,
  });

  final String html;

  @override
  createState() => _ProseMirrorWebview2State();
}

class _ProseMirrorWebview2State extends State<ProseMirrorEmbeddedWebView> {
  final GlobalKey _key = GlobalKey();

  double _height = 1000;

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

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: _height,
      child: InAppWebView(
        key: _key,
        initialSettings: _settings,
        initialData: InAppWebViewInitialData(
          data: _htmlTemplate.replaceAll('__CODE__', widget.html),
          baseUrl: WebUri(Env.baseUrl),
        ),
        onWebViewCreated: (controller) {
          controller.addJavaScriptHandler(
            handlerName: 'setHeight',
            callback: (data) {
              final height = (data[0] as num).toDouble();
              setState(() {
                _height = height;
              });
            },
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
