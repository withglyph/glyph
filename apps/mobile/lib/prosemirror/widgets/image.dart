import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:auto_route/auto_route.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/prosemirror_widget_image_query.req.gql.dart';
import 'package:glyph/icons/tabler.dart';
import 'package:glyph/prosemirror/schema.dart';
import 'package:glyph/themes/colors.dart';

class ProseMirrorWidgetImage extends StatelessWidget {
  const ProseMirrorWidgetImage({
    required this.id,
    required this.size,
    required this.align,
    super.key,
  });

  factory ProseMirrorWidgetImage.node(ProseMirrorNode node) {
    return ProseMirrorWidgetImage(
      id: node.attrs?['id'] as String? ?? '',
      size: (node.attrs?['size'] as String?) ?? 'full',
      align: (node.attrs?['align'] as String?) ?? 'center',
    );
  }

  final String id;
  final String size;
  final String align;

  @override
  Widget build(BuildContext context) {
    if (id == '') {
      return const SizedBox.shrink();
    }

    return GraphQLOperation(
      operation: GProseMirrorWidgetImage_QueryReq(
        (b) => b..vars.id = id,
      ),
      builder: (context, client, data) {
        return LayoutBuilder(
          builder: (context, constraints) {
            if (size == 'full') {
              return Pressable(
                child: CachedNetworkImage(
                  imageUrl: data.image.url,
                  width: constraints.maxWidth,
                  fit: BoxFit.fitWidth,
                  fadeInDuration: Duration.zero,
                ),
                onPressed: () async {
                  await showDialog(
                    context: context,
                    useSafeArea: false,
                    builder: (context) {
                      return _Viewer(url: data.image.url);
                    },
                  );
                },
              );
            } else {
              return Align(
                alignment: switch (align) {
                  'left' => Alignment.centerLeft,
                  'center' => Alignment.center,
                  'right' => Alignment.centerRight,
                  _ => Alignment.center,
                },
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 500),
                  child: Pressable(
                    child: CachedNetworkImage(
                      imageUrl: data.image.url,
                      fit: BoxFit.scaleDown,
                      fadeInDuration: Duration.zero,
                    ),
                    onPressed: () async {
                      await showDialog(
                        context: context,
                        useSafeArea: false,
                        builder: (context) {
                          return _Viewer(url: data.image.url);
                        },
                      );
                    },
                  ),
                ),
              );
            }
          },
        );
      },
    );
  }
}

class _Viewer extends StatelessWidget {
  const _Viewer({required this.url});

  final String url;

  @override
  Widget build(BuildContext context) {
    final safeAreaTopHeight = MediaQuery.of(context).padding.top;

    return Box(
      color: BrandColors.gray_900,
      child: Stack(
        children: [
          InteractiveViewer(
            maxScale: 8.0,
            boundaryMargin: const Pad(all: 100),
            child: Center(
              child: CachedNetworkImage(
                imageUrl: url,
                fadeInDuration: const Duration(milliseconds: 150),
                fadeOutDuration: Duration.zero,
                placeholder: (context, url) {
                  return const Center(child: CircularProgressIndicator(color: BrandColors.gray_200));
                },
              ),
            ),
          ),
          Positioned(
            top: safeAreaTopHeight + 16,
            right: 20,
            child: Pressable(
              child: const Icon(Tabler.x, color: BrandColors.gray_200),
              onPressed: () async {
                await context.router.maybePop();
              },
            ),
          ),
        ],
      ),
    );
  }
}
