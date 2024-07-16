import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/prosemirror_widget_embed_unfurl_embed_mutation.req.gql.dart';
import 'package:glyph/prosemirror/schema.dart';
import 'package:glyph/prosemirror/special/embedded_webview.dart';
import 'package:glyph/prosemirror/special/padded.dart';
import 'package:glyph/themes/colors.dart';
import 'package:url_launcher/url_launcher.dart';

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
          'opengraph' => ProseMirrorPadded(
              child: Pressable(
                child: Container(
                  clipBehavior: Clip.antiAlias,
                  decoration: BoxDecoration(
                    border: Border.all(color: BrandColors.gray_200),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Gap(16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Gap(12),
                            Text(
                              data.unfurlEmbed.title ?? '(제목 없음)',
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
                            ),
                            const Gap(2),
                            if (data.unfurlEmbed.description != null)
                              Text(
                                data.unfurlEmbed.description!,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(fontSize: 12, color: BrandColors.gray_400),
                              ),
                            const Gap(6),
                            Text(
                              Uri.parse(data.unfurlEmbed.url).host,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontSize: 11, color: BrandColors.brand_400),
                            ),
                            const Gap(12),
                          ],
                        ),
                      ),
                      const Gap(32),
                      if (data.unfurlEmbed.thumbnailUrl != null) ...[
                        const Box(width: 1, color: BrandColors.gray_200),
                        CachedNetworkImage(
                          imageUrl: data.unfurlEmbed.thumbnailUrl!,
                          width: 100,
                          height: 100,
                          fit: BoxFit.cover,
                          fadeInDuration: const Duration(milliseconds: 150),
                        ),
                      ],
                    ],
                  ),
                ),
                onPressed: () async {
                  try {
                    await launchUrl(
                      Uri.parse(data.unfurlEmbed.url),
                      mode: LaunchMode.inAppBrowserView,
                    );
                  } on Exception {
                    // ignore
                  }
                },
              ),
            ),
          _ => const SizedBox.shrink(),
        };
      },
    );
  }
}
