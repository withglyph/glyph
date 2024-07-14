import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:glyph/prosemirror/schema.dart';
import 'package:glyph/prosemirror/special/padded.dart';
import 'package:glyph/themes/colors.dart';

const String _getHeightJsSource = '''
  var getHeight = function() {
    window.flutter_inappwebview.callHandler('getHeight', document.body.scrollHeight);
  };
  getHeight();

  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      getHeight();
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
  });
''';

class ProseMirrorWidgetHtml extends StatelessWidget {
  const ProseMirrorWidgetHtml({
    required this.node,
    super.key,
  });

  factory ProseMirrorWidgetHtml.node(ProseMirrorNode node) {
    return ProseMirrorWidgetHtml(
      node: node,
    );
  }

  final ProseMirrorNode node;

  @override
  Widget build(BuildContext context) {
    final settings = InAppWebViewSettings(
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

    double height = 1.0;

    return ProseMirrorPadded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const DecoratedBox(
            decoration: BoxDecoration(color: BrandColors.gray_100),
            child: Padding(
              padding: Pad(horizontal: 10, vertical: 5),
              child: Text(
                'HTML',
                style: TextStyle(
                  color: BrandColors.gray_400,
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ),
          DecoratedBox(
            decoration: BoxDecoration(
              border: Border.all(color: BrandColors.gray_150),
            ),
            child: StatefulBuilder(
              builder: (context, setState) {
                return SizedBox(
                  height: height,
                  child: InAppWebView(
                    key: key,
                    initialSettings: settings,
                    initialData: InAppWebViewInitialData(data: node.content?.first.text ?? ''),
                    preventGestureDelay: true,
                    onWebViewCreated: (controller) async {
                      controller.addJavaScriptHandler(
                        handlerName: 'getHeight',
                        callback: (data) {
                          final newHeight = double.parse(data[0].toString());
                          setState(() {
                            height = newHeight;
                          });
                        },
                      );
                    },
                    onLoadStop: (controller, url) async {
                      await controller.evaluateJavascript(
                        source: _getHeightJsSource,
                      );
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
