import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:glyph/prosemirror/builder.dart';
import 'package:glyph/prosemirror/schema.dart';

class ProseMirrorWidgetDocument extends StatelessWidget {
  const ProseMirrorWidgetDocument({
    required this.documentParagraphIndent,
    required this.documentParagraphSpacing,
    required this.children,
    super.key,
  });

  factory ProseMirrorWidgetDocument.node(ProseMirrorNode node) {
    return ProseMirrorWidgetDocument(
      documentParagraphIndent: (node.attrs?['documentParagraphIndent'] as num?)?.toDouble() ?? 1,
      documentParagraphSpacing: (node.attrs?['documentParagraphSpacing'] as num?)?.toDouble() ?? 1,
      children: node.content?.map(ProseMirrorWidgetBuilder.build).toList() ?? [],
    );
  }

  final double documentParagraphIndent;
  final double documentParagraphSpacing;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return ProseMirrorWidgetDocumentData(
      documentParagraphIndent: documentParagraphIndent,
      documentParagraphSpacing: documentParagraphSpacing,
      child: SliverList.separated(
        itemCount: children.length,
        itemBuilder: (context, index) {
          return children[index];
        },
        separatorBuilder: (context, index) {
          return Gap(documentParagraphSpacing * 16);
        },
      ),
    );
  }
}

class ProseMirrorWidgetDocumentData extends InheritedWidget {
  const ProseMirrorWidgetDocumentData({
    required this.documentParagraphIndent,
    required this.documentParagraphSpacing,
    required super.child,
    super.key,
  });

  factory ProseMirrorWidgetDocumentData.of(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<ProseMirrorWidgetDocumentData>()!;
  }

  final double documentParagraphIndent;
  final double documentParagraphSpacing;

  @override
  bool updateShouldNotify(ProseMirrorWidgetDocumentData oldWidget) {
    return documentParagraphIndent != oldWidget.documentParagraphIndent ||
        documentParagraphSpacing != oldWidget.documentParagraphSpacing;
  }
}
