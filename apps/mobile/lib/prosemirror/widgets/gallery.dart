import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:auto_route/auto_route.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/dot.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/extensions/iterable.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/prosemirror_widget_gallery_query.req.gql.dart';
import 'package:glyph/icons/tabler.dart';
import 'package:glyph/prosemirror/schema.dart';
import 'package:glyph/themes/colors.dart';

class ProseMirrorWidgetGallery extends StatefulWidget {
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
  createState() => _ProseMirrorWidgetGalleryState();
}

class _ProseMirrorWidgetGalleryState extends State<ProseMirrorWidgetGallery> with AutomaticKeepAliveClientMixin {
  @override
  Widget build(BuildContext context) {
    super.build(context);

    return Align(
      alignment: switch (widget.align) {
        'left' => Alignment.centerLeft,
        'center' => Alignment.center,
        'right' => Alignment.centerRight,
        _ => Alignment.center,
      },
      child: ConstrainedBox(
        constraints: BoxConstraints(maxWidth: widget.size == 'compact' ? 500 : double.infinity),
        child: switch (widget.layout) {
          'scroll' => _Scroll(ids: widget.ids),
          'grid-2' => _Grid(ids: widget.ids, column: 2),
          'grid-3' => _Grid(ids: widget.ids, column: 3),
          'slide-1' => _Slide(ids: widget.ids, column: 1),
          'slide-2' => _Slide(ids: widget.ids, column: 2),
          _ => const SizedBox.shrink(),
        },
      ),
    );
  }

  @override
  bool get wantKeepAlive => true;
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
            return _Viewer(
              builder: (context, constraints) {
                return SizedBox.fromSize(
                  size: constraints.biggest,
                  child: FittedBox(
                    child: child,
                  ),
                );
              },
            );
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
    final child = Wrap(
      children: [
        for (final id in ids)
          FractionallySizedBox(
            widthFactor: 1 / column,
            child: _Image(id: id),
          ),
      ],
    );

    return Pressable(
      child: child,
      onPressed: () async {
        await showDialog(
          context: context,
          useSafeArea: false,
          builder: (context) {
            return _Viewer(
              builder: (context, constraints) {
                return SizedBox.fromSize(
                  size: constraints.biggest,
                  child: FittedBox(
                    child: ConstrainedBox(
                      constraints: constraints,
                      child: child,
                    ),
                  ),
                );
              },
            );
          },
        );
      },
    );
  }
}

class _Slide extends StatefulWidget {
  const _Slide({required this.ids, required this.column});

  final List<String> ids;
  final int column;

  @override
  createState() => _SlideState();
}

class _SlideState extends State<_Slide> {
  final _scrollController = PageController();

  int _page = 0;
  int get _total => (widget.ids.length / widget.column).ceil();

  @override
  void initState() {
    super.initState();

    _scrollController.addListener(() {
      final page = _scrollController.page?.round() ?? 0;
      if (page != _page && mounted) {
        setState(() {
          _page = page;
        });
      }
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        LayoutBuilder(
          builder: (context, constraints) {
            return SingleChildScrollView(
              controller: _scrollController,
              physics: const PageScrollPhysics(),
              scrollDirection: Axis.horizontal,
              child: Pressable(
                child: Row(
                  children: [
                    for (final id in widget.ids)
                      SizedBox(
                        width: constraints.maxWidth / widget.column,
                        child: _Image(id: id),
                      ),
                  ],
                ),
                onPressed: () async {
                  await showDialog(
                    context: context,
                    useSafeArea: false,
                    builder: (context) {
                      return _Viewer(
                        builder: (context, constraints) {
                          return SizedBox.fromSize(
                            size: constraints.biggest,
                            child: FittedBox(
                              child: Row(
                                children: [
                                  for (final id in widget.ids) _Image(id: id),
                                ],
                              ),
                            ),
                          );
                        },
                      );
                    },
                  );
                },
              ),
            );
          },
        ),
        const Gap(10),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            for (var i = 0; i < _total; i++)
              Dot(
                size: 8,
                color: i == _page ? BrandColors.gray_800 : BrandColors.gray_300,
              ),
          ].intersperse(const Gap(6)).toList(),
        ),
      ],
    );
  }
}

class _Viewer extends StatelessWidget {
  const _Viewer({required this.builder});

  final Widget Function(BuildContext context, BoxConstraints constraints) builder;

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
                constrained: false,
                maxScale: double.infinity,
                boundaryMargin: const Pad(all: 100),
                child: builder(context, constraints),
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
