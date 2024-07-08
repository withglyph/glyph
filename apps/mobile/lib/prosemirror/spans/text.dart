import 'package:collection/collection.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:glyph/extensions/color.dart';
import 'package:glyph/prosemirror/schema.dart';
import 'package:glyph/themes/colors.dart';
import 'package:url_launcher/url_launcher.dart';

class ProseMirrorSpanText extends TextSpan {
  const ProseMirrorSpanText({
    super.text,
    super.style,
    super.children,
    super.recognizer,
  });

  factory ProseMirrorSpanText.node(ProseMirrorNode node) {
    final link = node.marks?.firstWhereOrNull((mark) => mark.type == 'link');

    final fontColor = node.marks?.firstWhereOrNull((mark) => mark.type == 'font_color');
    final fontFamily = node.marks?.firstWhereOrNull((mark) => mark.type == 'font_family');
    final fontSize = node.marks?.firstWhereOrNull((mark) => mark.type == 'font_size');

    final style = TextStyle(
      color: fontColor == null ? BrandColors.gray_900 : HexColor.fromHex(fontColor.attrs!['fontColor']! as String),
      decoration: TextDecoration.combine([
        if (node.marks?.any((mark) => mark.type == 'underline') == true) TextDecoration.underline,
        if (node.marks?.any((mark) => mark.type == 'strike') == true) TextDecoration.lineThrough,
      ]),
      fontFamily: fontFamily == null ? 'Pretendard' : fontFamily.attrs!['fontFamily']! as String,
      fontSize: fontSize == null ? 16 : (fontSize.attrs!['fontSize']! as num).toDouble(),
      fontStyle: node.marks?.any((mark) => mark.type == 'italic') == true ? FontStyle.italic : FontStyle.normal,
      fontWeight: node.marks?.any((mark) => mark.type == 'bold') == true ? FontWeight.w700 : FontWeight.w400,
    );

    if (link == null) {
      return ProseMirrorSpanText(
        text: node.text!,
        style: style,
      );
    } else {
      return ProseMirrorSpanText(
        text: node.text!,
        recognizer: TapGestureRecognizer()
          ..onTap = () async {
            try {
              await launchUrl(
                Uri.parse(link.attrs!['href']! as String),
                mode: LaunchMode.inAppBrowserView,
              );
            } on Exception {
              // ignore
            }
          },
        style: style.copyWith(
          color: BrandColors.gray_500,
          decoration: TextDecoration.combine(
            [TextDecoration.underline, if (style.decoration != null) style.decoration!],
          ),
        ),
      );
    }
  }
}
