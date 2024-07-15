import 'package:flutter/material.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/prosemirror_widget_embed_unfurl_embed_mutation.req.gql.dart';
import 'package:glyph/prosemirror/schema.dart';
import 'package:glyph/prosemirror/special/embedded_webview.dart';
import 'package:glyph/prosemirror/special/padded.dart';

class ProseMirrorWidgetEmbed extends StatelessWidget {
  const ProseMirrorWidgetEmbed({
    required this.url,
    required this.mode,
    super.key,
  });

  factory ProseMirrorWidgetEmbed.node(ProseMirrorNode node) {
    return ProseMirrorWidgetEmbed(
      url: node.attrs?['url'] as String? ?? '',
      mode: node.attrs?['mode'] as String? ?? 'opengraph',
    );
  }

  final String url;
  final String mode;

  @override
  Widget build(BuildContext context) {
    return GraphQLOperation(
      operation: GProseMirrorWidgetEmbed_UnfurlEmbed_MutationReq(
        (b) => b..vars.input.url = url,
      ),
      builder: (context, client, data) {
        return switch (mode) {
          'embed-full' => ProseMirrorEmbeddedWebView(html: data.unfurlEmbed.html!),
          'embed-compact' => ProseMirrorPadded(
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 500),
                  child: ProseMirrorEmbeddedWebView(html: data.unfurlEmbed.html!),
                ),
              ),
            ),
          'opengraph' => const ProseMirrorPadded(child: SizedBox.shrink()),
          _ => const SizedBox.shrink(),
        };
      },
    );
  }
}
