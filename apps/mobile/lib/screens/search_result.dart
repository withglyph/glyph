import 'dart:async';

import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/accordion.dart';
import 'package:glyph/components/btn.dart';
import 'package:glyph/components/empty_state.dart';
import 'package:glyph/components/heading.dart';
import 'package:glyph/components/horizontal_divider.dart';
import 'package:glyph/components/post_card.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/components/pull_to_refresh.dart';
import 'package:glyph/components/search_input.dart';
import 'package:glyph/context/bottom_sheet.dart';
import 'package:glyph/extensions/iterable.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/schema.schema.gql.dart';
import 'package:glyph/graphql/__generated__/search_result_screen_query.req.gql.dart';
import 'package:glyph/icons/tabler.dart';
import 'package:glyph/icons/tabler_bold.dart';
import 'package:glyph/shells/default.dart';
import 'package:glyph/themes/colors.dart';

enum _SearchOrderByKind {
  accuracy,
  latest,
}

@RoutePage()
class SearchResultScreen extends ConsumerStatefulWidget {
  const SearchResultScreen({this.query = '', super.key});

  final String query;

  @override
  createState() => _SearchResultScreenState();
}

class _SearchResultScreenState extends ConsumerState<SearchResultScreen> with SingleTickerProviderStateMixin {
  Set<String> includeTags = {};
  Set<String> excludeTags = {};
  _SearchOrderByKind orderBy = _SearchOrderByKind.accuracy;
  bool? adultFilter;

  int _page = 1;
  String _query = '';

  bool _fetching = false;
  bool _eol = false;

  late GSearchResultScreen_QueryReq req;

  @override
  void initState() {
    super.initState();
    _query = widget.query;

    req = GSearchResultScreen_QueryReq(
      (b) => b
        ..requestId = 'SearchResultScreen_Query'
        ..vars.query = widget.query
        ..vars.page = _page
        ..vars.orderBy =
            orderBy == _SearchOrderByKind.accuracy ? GSearchOrderByKind.ACCURACY : GSearchOrderByKind.LATEST
        ..vars.includeTags.addAll(includeTags)
        ..vars.excludeTags.addAll(excludeTags)
        ..vars.adultFilter = adultFilter,
    );
  }

  @override
  Widget build(BuildContext context) {
    return DefaultShell(
      resizeToAvoidBottomInset: false,
      appBar: Heading.empty(),
      child: GraphQLOperation(
        operation: req,
        builder: (context, client, data) {
          final posts = data.searchPosts.posts;

          openSearchFilterMenu(int initiallyExpandedFilterIndex) async {
            await context.showBottomSheet(
              title: '검색 필터',
              builder: (context) {
                return _SearchFilter(
                  onApply: ({
                    required includeTagsDraft,
                    required excludeTagsDraft,
                    required orderByDraft,
                    adultFilterDraft,
                  }) {
                    _page = 1;
                    includeTags = includeTagsDraft;
                    excludeTags = excludeTagsDraft;
                    orderBy = orderByDraft;
                    adultFilter = adultFilterDraft;
                    req = req.rebuild(
                      (b) => b
                        ..vars.query = _query
                        ..vars.page = _page
                        ..vars.includeTags.replace(includeTags)
                        ..vars.excludeTags.replace(excludeTags)
                        ..vars.orderBy = orderBy == _SearchOrderByKind.accuracy
                            ? GSearchOrderByKind.ACCURACY
                            : GSearchOrderByKind.LATEST
                        ..vars.adultFilter = adultFilter
                        ..updateResult = (previous, result) => result,
                    );
                    context.router.maybePop();
                    _fetching = true;
                    unawaited(
                      client.request(req).then((value) {
                        _fetching = false;
                        _eol = posts.length == value.searchPosts.posts.length;
                      }),
                    );
                    setState(() {});
                  },
                  initiallyExpandedFilterIndex: initiallyExpandedFilterIndex,
                  includeTags: includeTags,
                  excludeTags: excludeTags,
                  orderBy: orderBy,
                  adultFilter: adultFilter,
                );
              },
            );
          }

          return Column(
            children: [
              Column(
                children: [
                  Padding(
                    padding: const Pad(horizontal: 20, vertical: 8),
                    child: SearchInput(
                      action: Pressable(
                        onPressed: () async {
                          await context.router.maybePop();
                        },
                        child: const Icon(
                          Tabler.arrow_left,
                          size: 24,
                          color: BrandColors.gray_900,
                        ),
                      ),
                      initialValue: _query,
                      onSearch: (value, controller) {
                        _query = value;
                        _page = 1;
                        req = req.rebuild(
                          (b) => b
                            ..vars.query = _query
                            ..vars.page = _page
                            ..updateResult = (previous, result) => result,
                        );

                        _fetching = true;
                        unawaited(
                          client.request(req).then((value) {
                            _fetching = false;
                            _eol = posts.length == value.searchPosts.posts.length;
                          }),
                        );
                        setState(() {});
                      },
                    ),
                  ),
                  DecoratedBox(
                    decoration: const BoxDecoration(
                      border: Border(
                        top: BorderSide(
                          color: BrandColors.gray_50,
                        ),
                        bottom: BorderSide(
                          color: BrandColors.gray_50,
                        ),
                      ),
                    ),
                    child: SingleChildScrollView(
                      physics: const AlwaysScrollableScrollPhysics(
                        parent: BouncingScrollPhysics(),
                      ),
                      padding: const Pad(horizontal: 20, vertical: 12.5),
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: [
                          _SearchFilterChip(
                            '포함 태그${includeTags.isNotEmpty ? ' ${includeTags.length}' : ''}',
                            kind: _SearchFilterChipKind.fillSearch,
                            selected: includeTags.isNotEmpty,
                            onPressed: () async => openSearchFilterMenu(0),
                          ),
                          _SearchFilterChip(
                            '제외 태그${excludeTags.isNotEmpty ? ' ${excludeTags.length}' : ''}',
                            kind: _SearchFilterChipKind.fillSearch,
                            selected: excludeTags.isNotEmpty,
                            onPressed: () async => openSearchFilterMenu(1),
                          ),
                          _SearchFilterChip(
                            orderBy == _SearchOrderByKind.accuracy ? '정확도순' : '최신순',
                            kind: _SearchFilterChipKind.fillSearch,
                            selected: orderBy == _SearchOrderByKind.latest,
                            onPressed: () async => openSearchFilterMenu(2),
                          ),
                          _SearchFilterChip(
                            adultFilter == null
                                ? '성인물 표시'
                                : adultFilter!
                                    ? '성인물만'
                                    : '성인물 제외',
                            kind: _SearchFilterChipKind.fillSearch,
                            selected: adultFilter != null,
                            onPressed: () async => openSearchFilterMenu(3),
                          ),
                        ].intersperse(const Gap(8)).toList(),
                      ),
                    ),
                  ),
                ],
              ),
              Expanded(
                child: (posts.isEmpty)
                    ? const EmptyState(
                        icon: TablerBold.notes_off,
                        title: '검색 결과가 없어요',
                        description: '다른 키워드 및 태그로 검색해보세요',
                      )
                    : NotificationListener<ScrollUpdateNotification>(
                        onNotification: (notification) {
                          if (notification.metrics.extentAfter <= 200) {
                            if (!_fetching && !_eol) {
                              _fetching = true;
                              final newReq = req.rebuild(
                                (b) => b
                                  ..vars.page = ++_page
                                  ..updateResult = (previous, result) => previous
                                      ?.rebuild((b) => b..searchPosts.posts.addAll(result?.searchPosts.posts ?? [])),
                              );

                              unawaited(
                                client.request(newReq).then((value) {
                                  _fetching = false;
                                  if (posts.length == value.searchPosts.posts.length) {
                                    _eol = true;
                                  }
                                }),
                              );
                            }
                          }

                          return false;
                        },
                        child: PullToRefresh.listView(
                          onRefresh: () async {
                            _page = 1;
                            await client.request(req);
                          },
                          itemCount: posts.length,
                          itemBuilder: (context, index) {
                            return PostCard(
                              posts[index],
                              padding: const Pad(horizontal: 20, vertical: 18),
                              dots: posts[index].space!.meAsMember == null,
                            );
                          },
                          separatorBuilder: (context, index) {
                            return const Padding(
                              padding: Pad(horizontal: 20),
                              child: HorizontalDivider(
                                color: BrandColors.gray_50,
                              ),
                            );
                          },
                          emptyWidget: const EmptyState(
                            icon: TablerBold.notes_off,
                            title: '검색 결과가 없어요',
                            description: '다른 키워드 및 태그로 검색해보세요',
                          ),
                        ),
                      ),
              ),
            ],
          );
        },
      ),
    );
  }
}

enum _SearchFilterChipKind {
  fillSearch,
  fill,
  outline,
}

class _SearchFilterChip extends StatelessWidget {
  const _SearchFilterChip(
    this.title, {
    this.selected = false,
    this.onPressed,
    this.kind = _SearchFilterChipKind.fill,
  });

  final String title;
  final bool selected;
  final Function()? onPressed;
  final _SearchFilterChipKind kind;

  @override
  Widget build(BuildContext context) {
    return Pressable(
      onPressed: onPressed,
      child: switch (kind) {
        _SearchFilterChipKind.fillSearch => Container(
            padding: const Pad(vertical: 6, left: 12, right: 10),
            decoration: BoxDecoration(
              color: selected ? BrandColors.gray_800 : Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(
                color: selected ? BrandColors.gray_800 : BrandColors.gray_100,
              ),
            ),
            child: Row(
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: selected ? Colors.white : BrandColors.gray_800,
                  ),
                ),
                const Gap(4),
                const Icon(
                  Tabler.chevron_down,
                  size: 14,
                  color: BrandColors.gray_400,
                ),
              ],
            ),
          ),
        _SearchFilterChipKind.fill => Container(
            padding: const Pad(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: selected ? BrandColors.gray_800 : Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(
                color: selected ? BrandColors.gray_800 : BrandColors.gray_150,
              ),
            ),
            child: Text(
              title,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: selected ? Colors.white : BrandColors.gray_400,
              ),
            ),
          ),
        _SearchFilterChipKind.outline => Container(
            padding: const Pad(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(
                color: selected ? BrandColors.gray_900 : Colors.transparent,
              ),
            ),
            child: Text(
              title,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: selected ? BrandColors.gray_900 : BrandColors.gray_400,
              ),
            ),
          ),
      },
    );
  }
}

class _TagChip extends StatelessWidget {
  const _TagChip(
    this.tag, {
    this.onDeleted,
  });

  final String tag;
  final Function()? onDeleted;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        border: Border.all(color: const Color(0xFFF7F7F7)),
        borderRadius: BorderRadius.circular(2),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Box(
            color: const Color(0xFFF3F3F3),
            padding: const Pad(vertical: 5, left: 8, right: 6),
            child: Row(
              children: [
                Text(
                  '#$tag',
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: BrandColors.gray_600,
                  ),
                ),
                const Gap(4),
                Pressable(
                  onPressed: onDeleted,
                  child: const Icon(
                    Tabler.x,
                    size: 12,
                    color: BrandColors.gray_500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SearchFilter extends StatefulWidget {
  const _SearchFilter({
    required this.onApply,
    required this.initiallyExpandedFilterIndex,
    required this.includeTags,
    required this.excludeTags,
    required this.orderBy,
    required this.adultFilter,
  });

  final Set<String> includeTags;
  final Set<String> excludeTags;
  final _SearchOrderByKind orderBy;
  final bool? adultFilter;
  final int? initiallyExpandedFilterIndex;
  final Function({
    required Set<String> includeTagsDraft,
    required Set<String> excludeTagsDraft,
    required _SearchOrderByKind orderByDraft,
    bool? adultFilterDraft,
  }) onApply;

  @override
  createState() => _SearchFilterState();
}

class _SearchFilterState extends State<_SearchFilter> {
  @override
  void initState() {
    super.initState();
    includeTagsDraft = widget.includeTags;
    excludeTagsDraft = widget.excludeTags;
    orderByDraft = widget.orderBy;
    adultFilterDraft = widget.adultFilter;
  }

  Set<String> includeTagsDraft = {};
  Set<String> excludeTagsDraft = {};
  _SearchOrderByKind orderByDraft = _SearchOrderByKind.accuracy;
  bool? adultFilterDraft;
  onReset() {
    includeTagsDraft.clear();
    excludeTagsDraft.clear();
    orderByDraft = _SearchOrderByKind.accuracy;
    adultFilterDraft = null;
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return Flexible(
      child: LayoutBuilder(
        builder: (context, constraints) {
          final height = constraints.maxHeight - 115;

          return ConstrainedBox(
            constraints: BoxConstraints.tightFor(height: height),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Expanded(
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(
                      parent: BouncingScrollPhysics(),
                    ),
                    child: Column(
                      children: [
                        Accordion(
                          title: '포함 태그',
                          initiallyExpanded: widget.initiallyExpandedFilterIndex == 0,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              SearchInput(
                                placeholder: '포함할 태그를 입력해주세요',
                                onSearch: (value, controller) {
                                  includeTagsDraft.add(value);
                                  controller.clear();
                                  setState(() {});
                                },
                              ),
                              if (includeTagsDraft.isNotEmpty) ...[
                                const Gap(8),
                                Wrap(
                                  spacing: 8,
                                  runSpacing: 10,
                                  children: includeTagsDraft
                                      .map(
                                        (tag) => _TagChip(
                                          tag,
                                          onDeleted: () {
                                            includeTagsDraft.remove(tag);
                                            setState(() {});
                                          },
                                        ),
                                      )
                                      .toList(),
                                ),
                              ],
                            ],
                          ),
                        ),
                        const HorizontalDivider(color: BrandColors.gray_50),
                        Accordion(
                          title: '제외 태그',
                          initiallyExpanded: widget.initiallyExpandedFilterIndex == 1,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              SearchInput(
                                placeholder: '제외할 태그를 입력해주세요',
                                onSearch: (value, controller) {
                                  excludeTagsDraft.add(value);
                                  controller.clear();
                                  setState(() {});
                                },
                              ),
                              if (excludeTagsDraft.isNotEmpty) ...[
                                const Gap(8),
                                Wrap(
                                  spacing: 8,
                                  runSpacing: 10,
                                  children: excludeTagsDraft
                                      .map(
                                        (tag) => _TagChip(
                                          tag,
                                          onDeleted: () {
                                            excludeTagsDraft.remove(tag);
                                            setState(() {});
                                          },
                                        ),
                                      )
                                      .toList(),
                                ),
                              ],
                            ],
                          ),
                        ),
                        const HorizontalDivider(color: BrandColors.gray_50),
                        Accordion(
                          title: '정렬',
                          initiallyExpanded: widget.initiallyExpandedFilterIndex == 2,
                          child: Row(
                            children: [
                              _SearchFilterChip(
                                '정확도순',
                                selected: orderByDraft == _SearchOrderByKind.accuracy,
                                onPressed: () {
                                  orderByDraft = _SearchOrderByKind.accuracy;
                                  setState(() {});
                                },
                              ),
                              const Gap(8),
                              _SearchFilterChip(
                                '최신순',
                                selected: orderByDraft == _SearchOrderByKind.latest,
                                onPressed: () {
                                  orderByDraft = _SearchOrderByKind.latest;
                                  setState(() {});
                                },
                              ),
                            ],
                          ),
                        ),
                        const HorizontalDivider(color: BrandColors.gray_50),
                        Accordion(
                          title: '성인물 표시',
                          initiallyExpanded: widget.initiallyExpandedFilterIndex == 3,
                          child: Row(
                            children: [
                              _SearchFilterChip(
                                '성인물 제외',
                                selected: adultFilterDraft == false,
                                onPressed: () {
                                  if (adultFilterDraft == false) {
                                    adultFilterDraft = null;
                                  } else {
                                    adultFilterDraft = false;
                                  }
                                  setState(() {});
                                },
                              ),
                              const Gap(8),
                              _SearchFilterChip(
                                '성인물만',
                                selected: adultFilterDraft == true,
                                onPressed: () {
                                  if (adultFilterDraft == true) {
                                    adultFilterDraft = null;
                                  } else {
                                    adultFilterDraft = true;
                                  }
                                  setState(() {});
                                },
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                Padding(
                  padding: const Pad(horizontal: 20, top: 10, bottom: 5),
                  child: Row(
                    children: [
                      Expanded(
                        child: Btn(
                          '선택 초기화',
                          size: BtnSize.large,
                          theme: BtnTheme.secondaryOutline,
                          onPressed: onReset,
                        ),
                      ),
                      const Gap(8),
                      Expanded(
                        child: Btn(
                          '적용',
                          size: BtnSize.large,
                          onPressed: () {
                            widget.onApply.call(
                              includeTagsDraft: includeTagsDraft,
                              excludeTagsDraft: excludeTagsDraft,
                              orderByDraft: orderByDraft,
                              adultFilterDraft: adultFilterDraft,
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
