import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/extensions/filesize.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/prosemirror_widget_file_query.req.gql.dart';
import 'package:glyph/icons/tabler.dart';
import 'package:glyph/prosemirror/schema.dart';
import 'package:glyph/prosemirror/special/padded.dart';
import 'package:glyph/themes/colors.dart';
import 'package:url_launcher/url_launcher.dart';

class ProseMirrorWidgetFile extends StatelessWidget {
  const ProseMirrorWidgetFile({
    required this.id,
    super.key,
  });

  factory ProseMirrorWidgetFile.node(ProseMirrorNode node) {
    return ProseMirrorWidgetFile(
      id: node.attrs!['id']! as String,
    );
  }

  final String id;

  @override
  Widget build(BuildContext context) {
    return GraphQLOperation(
      operation: GProseMirrorWidgetFile_QueryReq(
        (b) => b..vars.id = id,
      ),
      builder: (context, client, data) {
        return ProseMirrorPadded(
          child: Pressable(
            onPressed: () async {
              try {
                await launchUrl(
                  Uri.parse(data.file.url),
                  mode: LaunchMode.inAppBrowserView,
                );
              } on Exception {
                // ignore
              }
            },
            child: Container(
              constraints: const BoxConstraints(maxWidth: 500),
              decoration: BoxDecoration(
                border: Border.all(color: BrandColors.gray_100),
                borderRadius: BorderRadius.circular(4),
              ),
              padding: const Pad(all: 14),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          data.file.name,
                          style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 13,
                            color: BrandColors.gray_500,
                          ),
                        ),
                        const Gap(2),
                        Text(
                          data.file.size.readableFileSize(),
                          style: const TextStyle(
                            fontWeight: FontWeight.w500,
                            fontSize: 12,
                            color: BrandColors.gray_300,
                            letterSpacing: -0.048, // -0.4% of fontSize
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Gap(32),
                  const Icon(
                    Tabler.download,
                    size: 22,
                    color: BrandColors.gray_500,
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
