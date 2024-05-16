import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';

class WebViewScreen extends StatefulWidget {
  const WebViewScreen({super.key});

  @override
  State<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> {
  final GlobalKey webViewKey = GlobalKey();

  InAppWebViewController? webViewController;
  InAppWebViewSettings settings = InAppWebViewSettings();

  bool initialized = false;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      child: SafeArea(
        bottom: false,
        child: InAppWebView(
          key: webViewKey,
          initialUrlRequest: URLRequest(url: WebUri('https://withglyph.com')),
          initialSettings: settings,
          onProgressChanged: (_, progress) => {
            if (!initialized && progress == 100)
              {
                setState(() {
                  initialized = true;
                  FlutterNativeSplash.remove();
                })
              }
          },
        ),
      ),
    );
  }
}
