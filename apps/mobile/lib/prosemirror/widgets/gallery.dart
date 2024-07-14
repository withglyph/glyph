import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:auto_route/auto_route.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/prosemirror_widget_gallery_query.req.gql.dart';
import 'package:glyph/icons/tabler.dart';
import 'package:glyph/prosemirror/schema.dart';
import 'package:glyph/themes/colors.dart';

class ProseMirrorWidgetGallery extends StatelessWidget {
  const ProseMirrorWidgetGallery({
    required this.ids,
    required this.size,
    required this.align,
    required this.layout,
    super.key,
  });

  factory ProseMirrorWidgetGallery.node(ProseMirrorNode node) {
    return ProseMirrorWidgetGallery(
      ids: (node.attrs?['ids'] as List<dynamic>?)?.cast<String>() ?? [],
      size: (node.attrs?['size'] as String?) ?? 'full',
      align: (node.attrs?['align'] as String?) ?? 'center',
      layout: (node.attrs?['layout'] as String?) ?? 'scroll',
    );
  }

  final List<String> ids;
  final String size;
  final String align;
  final String layout;

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: switch (align) {
        'left' => Alignment.centerLeft,
        'center' => Alignment.center,
        'right' => Alignment.centerRight,
        _ => Alignment.center,
      },
      child: ConstrainedBox(
        constraints: BoxConstraints(maxWidth: size == 'compact' ? 500 : double.infinity),
        child: switch (layout) {
          'scroll' => _Scroll(ids: ids),
          'grid-2' => _Grid(ids: ids, column: 2),
          'grid-3' => _Grid(ids: ids, column: 3),
          _ => const SizedBox.shrink(),
        },
      ),
    );
  }
}

class _Image extends StatelessWidget {
  const _Image({required this.id});

  final String id;

  @override
  Widget build(BuildContext context) {
    return GraphQLOperation(
      operation: GProseMirrorWidgetGallery_QueryReq(
        (b) => b..vars.id = id,
      ),
      builder: (context, client, data) {
        return CachedNetworkImage(
          imageUrl: data.image.url,
          fit: BoxFit.scaleDown,
          fadeInDuration: Duration.zero,
        );
      },
    );
  }
}

class _Scroll extends StatelessWidget {
  const _Scroll({required this.ids});

  final List<String> ids;

  @override
  Widget build(BuildContext context) {
    final child = Column(
      children: [for (final id in ids) _Image(id: id)],
    );

    return Pressable(
      child: child,
      onPressed: () async {
        await showDialog(
          context: context,
          useSafeArea: false,
          builder: (context) {
            return _Viewer(child: child);
          },
        );
      },
    );
  }
}

class _Grid extends StatelessWidget {
  const _Grid({required this.ids, required this.column});

  final List<String> ids;
  final int column;

  @override
  Widget build(BuildContext context) {
    final child = LayoutBuilder(
      builder: (context, constraints) {
        return Wrap(
          children: [
            for (final id in ids)
              SizedBox(
                width: constraints.maxWidth / column,
                child: _Image(id: id),
              ),
          ],
        );
      },
    );

    return Pressable(
      child: child,
      onPressed: () async {
        await showDialog(
          context: context,
          useSafeArea: false,
          builder: (context) {
            return _Viewer(child: child);
          },
        );
      },
    );
  }
}

class _Viewer extends StatelessWidget {
  const _Viewer({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    final safeAreaTopHeight = MediaQuery.of(context).padding.top;

    return Box(
      color: BrandColors.gray_900,
      child: Stack(
        children: [
          LayoutBuilder(
            builder: (context, constraints) {
              return InteractiveViewer(
                maxScale: 8.0,
                boundaryMargin: const Pad(all: 100),
                child: SizedBox(
                  width: constraints.maxWidth,
                  height: constraints.maxHeight,
                  child: FittedBox(
                    child: SizedBox(
                      width: constraints.maxWidth,
                      child: child,
                    ),
                  ),
                ),
              );
            },
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
