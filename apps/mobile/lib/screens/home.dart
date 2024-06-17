import 'dart:async';

import 'package:auto_route/auto_route.dart';
import 'package:card_swiper/card_swiper.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/heading.dart';
import 'package:glyph/components/horizontal_divider.dart';
import 'package:glyph/components/post_card.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/components/svg_icon.dart';
import 'package:glyph/components/svg_image.dart';
import 'package:glyph/extensions/color.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/home_screen_query.req.gql.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/shells/default.dart';
import 'package:glyph/themes/colors.dart';
import 'package:transparent_image/transparent_image.dart';

@RoutePage()
class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();

    for (final carousel in _carousels) {
      unawaited(
        precacheImage(NetworkImage(carousel.backgroundImageUrl), context),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return DefaultShell(
      appBar: Heading.empty(),
      child: GraphQLOperation(
        operation: GHomeScreen_QueryReq(),
        builder: (context, client, data) {
          return CustomScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            slivers: [
              SliverToBoxAdapter(
                child: Column(
                  children: [
                    Heading(
                      bottomBorder: false,
                      leading: const SvgImage('logos/full', width: 80),
                      actions: [
                        Pressable(
                          child: const SvgIcon('notification'),
                          onPressed: () async {
                            await context.router.push(
                              const NotificationRoute(),
                            );
                          },
                        ),
                      ],
                    ),
                    const Gap(4),
                    const _Carousel(),
                    const Padding(
                      padding: EdgeInsets.symmetric(
                        horizontal: 20,
                        vertical: 22,
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          _Shortcut(
                            icon: 'illustrations/home_menu_1',
                            title: '에디터PICK',
                          ),
                          MaxGap(12),
                          _Shortcut(
                            icon: 'illustrations/home_menu_2',
                            title: '챌린지',
                          ),
                          MaxGap(12),
                          _Shortcut(
                            icon: 'illustrations/home_menu_3',
                            title: '지금 뜨는 태그',
                          ),
                          MaxGap(12),
                          _Shortcut(
                            icon: 'illustrations/home_menu_4',
                            title: '내 스페이스',
                          ),
                        ],
                      ),
                    ),
                    const HorizontalDivider(color: BrandColors.gray_50),
                    const Gap(8),
                    Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 20,
                        vertical: 8,
                      ),
                      child: Row(
                        children: [
                          const Text(
                            '구독',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const Spacer(),
                          Container(
                            padding: const EdgeInsets.fromLTRB(10, 5, 8, 5),
                            decoration: BoxDecoration(
                              border: Border.all(color: BrandColors.gray_150),
                              borderRadius: BorderRadius.circular(18),
                            ),
                            child: const Row(
                              children: [
                                Text(
                                  '최신순',
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: BrandColors.gray_600,
                                  ),
                                ),
                                Gap(3),
                                SvgIcon(
                                  'chevron-down',
                                  size: 14,
                                  color: BrandColors.gray_500,
                                ),
                              ],
                            ),
                          ),
                          const Gap(10),
                          Container(
                            padding: const EdgeInsets.fromLTRB(10, 5, 8, 5),
                            decoration: BoxDecoration(
                              border: Border.all(color: BrandColors.gray_150),
                              borderRadius: BorderRadius.circular(18),
                            ),
                            child: const Row(
                              children: [
                                Text(
                                  '필터',
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: BrandColors.gray_600,
                                  ),
                                ),
                                Gap(3),
                                SvgIcon(
                                  'filter-cog',
                                  size: 14,
                                  color: BrandColors.gray_500,
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              SliverList.separated(
                itemCount: data.followingFeed.length,
                itemBuilder: (context, index) {
                  return PostCard(
                    data.followingFeed[index],
                    padding: const EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 18,
                    ),
                  );
                },
                separatorBuilder: (context, index) {
                  return const HorizontalDivider(color: BrandColors.gray_50);
                },
              ),
            ],
          );
        },
      ),
    );
  }
}

final _carousels = <_CarouselData>[
  _CarouselData(
    title: '5월 30일 업데이트 노트',
    subtitle: '스페이스 관리 리뉴얼\n포스트 발행옵션 일괄 수정, 컬렉션 설명 추가',
    color: '#171717',
    backgroundImageUrl: 'https://glyph.pub/images/_/banner_updates_2.png',
    route: PostRoute(permalink: '2070481519'),
  ),
  _CarouselData(
    title: '<정산 기능 업데이트>',
    subtitle: '창작자를 위한 정산 수수료 0%',
    color: '#171717',
    backgroundImageUrl: 'https://glyph.pub/images/_/banner_settlement.png',
    route: PostRoute(permalink: '1858282558'),
  ),
  _CarouselData(
    title: '펜슬이 글리프로 바뀌었어요',
    subtitle: '리브랜딩 이야기',
    color: '#504C575A',
    backgroundImageUrl: 'https://glyph.pub/images/_/banner_rebranding_2.png',
    route: PostRoute(permalink: '1433497915'),
  ),
  _CarouselData(
    title: '트위터 프로필 연동하고\n포인트 받아가세요',
    subtitle: '2000P 적립 이벤트',
    color: '#124B8E',
    backgroundImageUrl:
        'https://glyph.pub/images/_/banner_twitter_events_2.png',
    route: PostRoute(permalink: '677483040'),
  ),
];

class _Carousel extends StatelessWidget {
  const _Carousel();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 150,
      child: Swiper(
        autoplay: true,
        autoplayDelay: 5000,
        fade: 0.9,
        duration: 500,
        curve: Curves.linearToEaseOut,
        viewportFraction: 0.9,
        itemCount: _carousels.length,
        itemBuilder: (context, index) {
          final carousel = _carousels[index];

          return Container(
            margin: const EdgeInsets.symmetric(horizontal: 4),
            clipBehavior: Clip.antiAlias,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(4),
            ),
            child: Stack(
              children: [
                Positioned.fill(
                  child: FadeInImage.memoryNetwork(
                    placeholder: kTransparentImage,
                    image: carousel.backgroundImageUrl,
                    fit: BoxFit.cover,
                    fadeInDuration: const Duration(milliseconds: 150),
                  ),
                ),
                Positioned(
                  left: 0,
                  right: 0,
                  bottom: 0,
                  child: Container(
                    constraints: const BoxConstraints(minHeight: 100),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 12,
                    ),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          HexColor.fromHex(carousel.color).withOpacity(0),
                          HexColor.fromHex(carousel.color),
                        ],
                      ),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.end,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          carousel.title,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: BrandColors.gray_0,
                          ),
                        ),
                        if (carousel.subtitle != null)
                          Text(
                            carousel.subtitle!,
                            style: const TextStyle(
                              fontSize: 13,
                              color: BrandColors.gray_0,
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
                Positioned(
                  right: 14,
                  bottom: 12,
                  child: Container(
                    padding: const EdgeInsets.fromLTRB(4, 2, 8, 2),
                    decoration: BoxDecoration(
                      color: BrandColors.gray_900.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(30),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        ConstrainedBox(
                          constraints: const BoxConstraints.tightFor(width: 13),
                          child: Text(
                            (index + 1).toString(),
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              fontSize: 11,
                              color: BrandColors.gray_0,
                            ),
                          ),
                        ),
                        const Gap(2),
                        Text(
                          '/',
                          style: TextStyle(
                            fontSize: 11,
                            color: BrandColors.gray_0.withOpacity(0.5),
                          ),
                        ),
                        const Gap(2),
                        Text(
                          _carousels.length.toString(),
                          style: TextStyle(
                            fontSize: 11,
                            color: BrandColors.gray_0.withOpacity(0.5),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        },
        onTap: (index) async {
          final carousel = _carousels[index];
          await context.router.push(carousel.route);
        },
      ),
    );
  }
}

class _CarouselData {
  _CarouselData({
    required this.title,
    required this.color,
    required this.backgroundImageUrl,
    required this.route,
    this.subtitle,
  });
  final String title;
  final String? subtitle;
  final String color;
  final String backgroundImageUrl;
  final PageRouteInfo route;
}

class _Shortcut extends StatelessWidget {
  const _Shortcut({
    required this.icon,
    required this.title,
  });

  final String icon;
  final String title;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 74,
      child: Column(
        children: [
          SvgImage(icon, width: 40, height: 24),
          const Gap(8),
          Text(
            title,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}
