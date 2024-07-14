import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:glyph/prosemirror/schema.dart';
import 'package:glyph/prosemirror/spans/hard_break.dart';
import 'package:glyph/prosemirror/spans/text.dart';
import 'package:glyph/prosemirror/widgets/access_barrier.dart';
import 'package:glyph/prosemirror/widgets/blockquote.dart';
import 'package:glyph/prosemirror/widgets/bullet_list.dart';
import 'package:glyph/prosemirror/widgets/code_block.dart';
import 'package:glyph/prosemirror/widgets/doc.dart';
import 'package:glyph/prosemirror/widgets/document.dart';
import 'package:glyph/prosemirror/widgets/embed.dart';
import 'package:glyph/prosemirror/widgets/gallery.dart';
import 'package:glyph/prosemirror/widgets/horizontal_rule.dart';
import 'package:glyph/prosemirror/widgets/html.dart';
import 'package:glyph/prosemirror/widgets/image.dart';
import 'package:glyph/prosemirror/widgets/list_item.dart';
import 'package:glyph/prosemirror/widgets/ordered_list.dart';
import 'package:glyph/prosemirror/widgets/paragraph.dart';
import 'package:glyph/themes/colors.dart';

abstract final class ProseMirrorWidgetBuilder {
  static final _builders = <String, Widget Function(ProseMirrorNode)>{
    'access_barrier': ProseMirrorWidgetAccessBarrier.node,
    'blockquote': ProseMirrorWidgetBlockquote.node,
    'bullet_list': ProseMirrorWidgetBulletList.node,
    'code_block': ProseMirrorWidgetCodeBlock.node,
    'doc': ProseMirrorWidgetDoc.node,
    'document': ProseMirrorWidgetDocument.node,
    'embed': ProseMirrorWidgetEmbed.node,
    'gallery': ProseMirrorWidgetGallery.node,
    'horizontal_rule': ProseMirrorWidgetHorizontalRule.node,
    'html': ProseMirrorWidgetHtml.node,
    'image': ProseMirrorWidgetImage.node,
    'list_item': ProseMirrorWidgetListItem.node,
    'ordered_list': ProseMirrorWidgetOrderedList.node,
    'paragraph': ProseMirrorWidgetParagraph.node,
  };

  static Widget build(ProseMirrorNode node) {
    final builder = _builders[node.type];
    if (builder == null) {
      if (kDebugMode) {
        print('No widget builder for ${node.type}');
      }

      return Box(
        height: 100,
        color: BrandColors.red_600,
        child: Center(
          child: Text(
            "Missing widget\n'${node.type}'",
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: BrandColors.gray_0,
            ),
          ),
        ),
      );
    }

    return builder(node);
  }
}

abstract final class ProseMirrorSpanBuilder {
  static final _builders = <String, InlineSpan Function(ProseMirrorNode)>{
    'text': ProseMirrorSpanText.node,
    'hard_break': ProseMirrorSpanHardBreak.node,
  };

  static InlineSpan build(ProseMirrorNode node) {
    final builder = _builders[node.type];
    if (builder == null) {
      if (kDebugMode) {
        print('No span builder for ${node.type}');
      }

      return TextSpan(text: "<Missing span '${node.type}'>");
    }

    return builder(node);
  }
}
