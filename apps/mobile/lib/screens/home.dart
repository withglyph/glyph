import 'package:auto_route/auto_route.dart';
import 'package:card_swiper/card_swiper.dart';
import 'package:collection/collection.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/Img.dart';
import 'package:glyph/components/heading.dart';
import 'package:glyph/components/post_card.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/components/svg_icon.dart';
import 'package:glyph/components/svg_image.dart';
import 'package:glyph/components/thumbnail_post_card.dart';
import 'package:glyph/extensions/color.dart';
import 'package:glyph/extensions/iterable.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/home_screen_query.data.gql.dart';
import 'package:glyph/graphql/__generated__/home_screen_query.req.gql.dart';
import 'package:glyph/graphql/__generated__/schema.schema.gql.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/themes/colors.dart';
import 'package:transparent_image/transparent_image.dart';

@RoutePage()
class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen>
    with TickerProviderStateMixin {
  final _carouselKey = GlobalKey();

  late AnimationController _headerAnimationController;
  late Animation<Color?> _headerBackgroundColorAnimation;
  late Animation<Color?> _headerForegroundColorAnimation;

  bool _showBottomBorder = false;

  final _carousels = <CarouselData>[
    CarouselData(
      title: '5월 30일 업데이트 노트',
      subtitle: '스페이스 관리 리뉴얼\n포스트 발행옵션 일괄 수정, 컬렉션 설명 추가',
      color: '#171717',
      backgroundImageUrl: 'https://glyph.pub/images/_/banner_updates_2.png',
      route: PostRoute(permalink: '2070481519'),
    ),
    CarouselData(
      title: '<정산 기능 업데이트>',
      subtitle: '창작자를 위한 정산 수수료 0%',
      color: '#171717',
      backgroundImageUrl: 'https://glyph.pub/images/_/banner_settlement.png',
      route: PostRoute(permalink: '1858282558'),
    ),
    CarouselData(
      title: '펜슬이 글리프로 바뀌었어요',
      subtitle: '리브랜딩 이야기',
      color: '#504C575A',
      backgroundImageUrl: 'https://glyph.pub/images/_/banner_rebranding_2.png',
      route: PostRoute(permalink: '1433497915'),
    ),
    CarouselData(
      title: '시즌 2 컴백!\n<나의 밤을 그대에게>',
      subtitle: '신을 섬기는 기사와, 그를 사랑하게 된 악마',
      bottomline: 'ⓒ유씨',
      color: '#9FAAA8',
      backgroundImageUrl: 'https://glyph.pub/images/_/banner_uc2.png',
      route: PlaceholderRoute(text: '컬렉션'),
    ),
    CarouselData(
      title: '트위터 프로필 연동하고\n포인트 받아가세요',
      subtitle: '2000P 적립 이벤트',
      color: '#124B8E',
      backgroundImageUrl:
          'https://glyph.pub/images/_/banner_twitter_events_2.png',
      route: PostRoute(permalink: '677483040'),
    ),
  ];

  int _featuredTagActiveIndex = 0;

  @override
  void initState() {
    super.initState();

    _headerAnimationController = AnimationController(
      vsync: this,
      duration: Duration.zero,
    );

    _headerBackgroundColorAnimation = ColorTween(
      begin: null,
      end: BrandColors.gray_0,
    ).animate(_headerAnimationController);

    _headerForegroundColorAnimation = ColorTween(
      begin: BrandColors.gray_0,
      end: BrandColors.gray_900,
    ).animate(_headerAnimationController);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();

    for (final carousel in _carousels) {
      precacheImage(NetworkImage(carousel.backgroundImageUrl), context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: Heading.animated(
        animation: _headerAnimationController,
        builder: (context) {
          return Heading(
            bottomBorder: _showBottomBorder,
            backgroundColor: _headerBackgroundColorAnimation.value,
            fallbackSystemUiOverlayStyle: SystemUiOverlayStyle.light,
            leading: SvgImage(
              'logos/full',
              height: 20,
              color: _headerForegroundColorAnimation.value,
            ),
            actions: [
              Pressable(
                child: SvgIcon(
                  'search',
                  color: _headerForegroundColorAnimation.value,
                ),
                onPressed: () {
                  context.router.push(PlaceholderRoute(text: '검색'));
                },
              ),
              const Gap(16),
              Pressable(
                child: SvgIcon(
                  'notification',
                  color: _headerForegroundColorAnimation.value,
                ),
                onPressed: () {
                  context.router.push(const NotificationRoute());
                },
              ),
            ],
          );
        },
      ),
      body: NotificationListener<ScrollUpdateNotification>(
        onNotification: (notification) {
          final box =
              _carouselKey.currentContext?.findRenderObject() as RenderBox;
          final offset = box.localToGlobal(Offset.zero);
          final safeAreaHeight = MediaQuery.of(context).padding.top;
          final carouselBottomPosition =
              offset.dy + box.size.height - 54 - safeAreaHeight;
          final value = clampDouble((-carouselBottomPosition + 50) / 50, 0, 1);

          _headerAnimationController.animateTo(value);

          setState(() {
            _showBottomBorder = value >= 1;
          });

          return false;
        },
        child: GraphQLOperation(
          operation: GHomeScreen_QueryReq(),
          builder: (context, client, data) {
            return SizedBox.expand(
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                child: Column(
                  children: [
                    ConstrainedBox(
                      constraints: const BoxConstraints.tightFor(height: 400),
                      child: Builder(
                        builder: (context) {
                          return Swiper(
                            key: _carouselKey,
                            pagination: SwiperCustomPagination(
                              builder: (context, config) {
                                return Container(
                                  alignment: Alignment.bottomRight,
                                  padding: const EdgeInsets.all(20),
                                  child: Container(
                                    padding:
                                        const EdgeInsets.fromLTRB(4, 2, 8, 2),
                                    decoration: BoxDecoration(
                                      color:
                                          BrandColors.gray_900.withOpacity(0.2),
                                      borderRadius: BorderRadius.circular(30),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        ConstrainedBox(
                                          constraints:
                                              const BoxConstraints.tightFor(
                                                  width: 13),
                                          child: Text(
                                            (config.activeIndex + 1).toString(),
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
                                            color: BrandColors.gray_0
                                                .withOpacity(0.5),
                                          ),
                                        ),
                                        const Gap(2),
                                        Text(
                                          config.itemCount.toString(),
                                          style: TextStyle(
                                            fontSize: 11,
                                            color: BrandColors.gray_0
                                                .withOpacity(0.5),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                );
                              },
                            ),
                            itemCount: _carousels.length,
                            itemBuilder: (context, index) {
                              final carousel = _carousels[index];

                              return Stack(
                                children: [
                                  Positioned.fill(
                                    child: FadeInImage.memoryNetwork(
                                      placeholder: kTransparentImage,
                                      image: carousel.backgroundImageUrl,
                                      fit: BoxFit.cover,
                                      fadeInDuration:
                                          const Duration(milliseconds: 150),
                                    ),
                                  ),
                                  Positioned(
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    child: Container(
                                      height: 200,
                                      padding: const EdgeInsets.all(20),
                                      decoration: BoxDecoration(
                                        gradient: LinearGradient(
                                          begin: Alignment.topCenter,
                                          end: Alignment.bottomCenter,
                                          colors: [
                                            HexColor.fromHex(carousel.color)
                                                .withOpacity(0),
                                            HexColor.fromHex(carousel.color),
                                          ],
                                        ),
                                      ),
                                      child: Column(
                                        mainAxisAlignment:
                                            MainAxisAlignment.end,
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            carousel.title,
                                            style: const TextStyle(
                                              fontSize: 22,
                                              fontWeight: FontWeight.w700,
                                              color: BrandColors.gray_0,
                                            ),
                                          ),
                                          if (carousel.subtitle != null) ...[
                                            const Gap(2),
                                            Text(
                                              carousel.subtitle!,
                                              style: const TextStyle(
                                                fontSize: 14,
                                                color: BrandColors.gray_0,
                                              ),
                                            ),
                                          ],
                                          if (carousel.bottomline != null) ...[
                                            const Gap(4),
                                            Text(
                                              carousel.bottomline!,
                                              style: TextStyle(
                                                fontSize: 12,
                                                fontWeight: FontWeight.w300,
                                                color: BrandColors.gray_0
                                                    .withOpacity(0.7),
                                              ),
                                            ),
                                          ],
                                        ],
                                      ),
                                    ),
                                  ),
                                ],
                              );
                            },
                            onTap: (index) {
                              final carousel = _carousels[index];
                              context.router.push(carousel.route);
                            },
                          );
                        },
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${data.me!.profile.name}님을 위한 추천',
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const Gap(16),
                          SingleChildScrollView(
                            physics: const AlwaysScrollableScrollPhysics(),
                            scrollDirection: Axis.horizontal,
                            clipBehavior: Clip.none,
                            child: Row(
                              children: data.featuredTagFeed
                                  .mapIndexed(
                                    (index, v) => v.when(
                                      featuredTag: (v) => _FeaturedTag(
                                        v.tag.name,
                                        isActive:
                                            _featuredTagActiveIndex == index,
                                        onPressed: () {
                                          setState(() {
                                            _featuredTagActiveIndex = index;
                                          });
                                        },
                                      ),
                                      featuredCategory: (v) => _FeaturedTag(
                                        switch (v.categoryId) {
                                          GPostCategory.ORIGINAL => '오리지널',
                                          GPostCategory.FANFICTION => '2차창작',
                                          GPostCategory.NONFICTION => '비문학',
                                          GPostCategory.OTHER => '기타',
                                          _ => '',
                                        },
                                        isActive:
                                            _featuredTagActiveIndex == index,
                                        onPressed: () {
                                          setState(() {
                                            _featuredTagActiveIndex = index;
                                          });
                                        },
                                      ),
                                      orElse: () => const SizedBox.shrink(),
                                    ),
                                  )
                                  .intersperse(const Gap(8))
                                  .toList(),
                            ),
                          ),
                          ListView.builder(
                            physics: const NeverScrollableScrollPhysics(),
                            shrinkWrap: true,
                            itemCount: 3,
                            padding: EdgeInsets.zero,
                            itemBuilder: (context, index) {
                              final post = data
                                  .featuredTagFeed[_featuredTagActiveIndex]
                                  .when(
                                featuredTag: (v) =>
                                    v.posts.elementAtOrNull(index),
                                featuredCategory: (v) =>
                                    v.posts.elementAtOrNull(index),
                                orElse: () => null,
                              );

                              if (post == null) {
                                return null;
                              }

                              return PostCard(
                                post,
                                padding:
                                    const EdgeInsets.symmetric(vertical: 18),
                              );
                            },
                          ),
                          if (data.me!.posts.isNotEmpty) ...[
                            const Gap(32),
                            const Text(
                              '이어서 써보세요',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const Gap(10),
                            SingleChildScrollView(
                              physics: const AlwaysScrollableScrollPhysics(),
                              scrollDirection: Axis.horizontal,
                              clipBehavior: Clip.none,
                              child: Row(
                                children: data.me!.posts
                                    .map((post) {
                                      return Pressable(
                                        child: Container(
                                          width: 280,
                                          height: 140,
                                          padding: const EdgeInsets.all(14),
                                          decoration: BoxDecoration(
                                            borderRadius:
                                                BorderRadius.circular(2),
                                            color: BrandColors.gray_50,
                                          ),
                                          child: Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              Container(
                                                padding:
                                                    const EdgeInsets.symmetric(
                                                  horizontal: 5,
                                                  vertical: 2,
                                                ),
                                                decoration: BoxDecoration(
                                                  borderRadius:
                                                      BorderRadius.circular(2),
                                                  color: BrandColors.gray_0,
                                                ),
                                                child: const Text(
                                                  '임시저장 포스트',
                                                  style: TextStyle(
                                                    fontSize: 11,
                                                    fontWeight: FontWeight.w600,
                                                    color: BrandColors.gray_500,
                                                  ),
                                                ),
                                              ),
                                              const Gap(6),
                                              Text(
                                                post.contentState.title ??
                                                    '(제목 없음)',
                                                style: const TextStyle(
                                                  fontSize: 14,
                                                  fontWeight: FontWeight.w600,
                                                ),
                                              ),
                                              if (post.contentState.subtitle !=
                                                      null ||
                                                  post.contentState.previewText
                                                      .isNotEmpty) ...[
                                                const Gap(2),
                                                Row(
                                                  children: [
                                                    if (post.contentState
                                                            .subtitle !=
                                                        null)
                                                      Flexible(
                                                        child: Text(
                                                          post.contentState
                                                              .subtitle!,
                                                          overflow: TextOverflow
                                                              .ellipsis,
                                                          style:
                                                              const TextStyle(
                                                            fontSize: 13,
                                                            color: BrandColors
                                                                .gray_500,
                                                          ),
                                                        ),
                                                      ),
                                                    if (post.contentState
                                                                .subtitle !=
                                                            null &&
                                                        post
                                                            .contentState
                                                            .previewText
                                                            .isNotEmpty) ...[
                                                      const Gap(4),
                                                      Container(
                                                        width: 1,
                                                        height: 12,
                                                        color: const Color(
                                                            0xFFD9D9D9),
                                                      ),
                                                      const Gap(4),
                                                    ],
                                                    if (post.contentState
                                                        .previewText.isNotEmpty)
                                                      Flexible(
                                                        child: Text(
                                                          post.contentState
                                                              .previewText,
                                                          overflow: TextOverflow
                                                              .ellipsis,
                                                          style:
                                                              const TextStyle(
                                                            fontSize: 13,
                                                            color: BrandColors
                                                                .gray_400,
                                                          ),
                                                        ),
                                                      ),
                                                  ],
                                                ),
                                              ],
                                            ],
                                          ),
                                        ),
                                        onPressed: () {
                                          context.router.push(
                                            EditorRoute(
                                              permalink: post.permalink,
                                            ),
                                          );
                                        },
                                      );
                                    })
                                    .intersperse(const Gap(8))
                                    .toList(),
                              ),
                            ),
                            const Gap(16),
                          ],
                          const Gap(32),
                          const Text(
                            '이번주 챌린지',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const Gap(10),
                          SingleChildScrollView(
                            physics: const AlwaysScrollableScrollPhysics(),
                            scrollDirection: Axis.horizontal,
                            clipBehavior: Clip.none,
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: data.challengeFeed
                                  .map((post) {
                                    return ThumbnailPostCard(
                                      post,
                                      padding: EdgeInsets.zero,
                                    );
                                  })
                                  .intersperse(const Gap(8))
                                  .toList(),
                            ),
                          ),
                          const Gap(48),
                          const Text(
                            '많이 찾은 컬렉션',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          ListView.builder(
                            physics: const NeverScrollableScrollPhysics(),
                            shrinkWrap: true,
                            itemCount: 3,
                            padding: EdgeInsets.zero,
                            itemBuilder: (context, index) {
                              final collection =
                                  data.collectionFeed.elementAtOrNull(index);

                              if (collection == null) {
                                return null;
                              }

                              return Container(
                                height: 100,
                                margin:
                                    const EdgeInsets.symmetric(vertical: 18),
                                child: Row(
                                  children: [
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            collection.name,
                                            overflow: TextOverflow.ellipsis,
                                            style: const TextStyle(
                                              fontSize: 14,
                                              fontWeight: FontWeight.w600,
                                            ),
                                          ),
                                          const Gap(1),
                                          if (collection.description != null)
                                            Text(
                                              collection.description!,
                                              overflow: TextOverflow.ellipsis,
                                              maxLines: 2,
                                              style: const TextStyle(
                                                fontSize: 13,
                                                color: BrandColors.gray_400,
                                              ),
                                            ),
                                          const Spacer(),
                                          Row(
                                            children: [
                                              Img(
                                                collection.space.icon,
                                                width: 18,
                                                height: 18,
                                              ),
                                              const Gap(4),
                                              Text(
                                                collection.space.name,
                                                style: const TextStyle(
                                                  fontSize: 12,
                                                  color: BrandColors.gray_400,
                                                ),
                                              )
                                            ],
                                          ),
                                        ],
                                      ),
                                    ),
                                    Img(
                                      collection.thumbnail,
                                      height: 100,
                                      aspectRatio: 3 / 4,
                                    )
                                  ],
                                ),
                              );
                            },
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

class CarouselData {
  final String title;
  final String? subtitle;
  final String? bottomline;
  final String color;
  final String backgroundImageUrl;
  final PageRouteInfo route;

  CarouselData({
    required this.title,
    this.subtitle,
    this.bottomline,
    required this.color,
    required this.backgroundImageUrl,
    required this.route,
  });
}

class _FeaturedTag extends StatelessWidget {
  const _FeaturedTag(
    this.name, {
    required this.isActive,
    required this.onPressed,
  });

  final String name;
  final bool isActive;
  final Function() onPressed;

  @override
  Widget build(BuildContext context) {
    return Pressable(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          border: Border.all(
            color: isActive ? BrandColors.gray_900 : BrandColors.gray_100,
          ),
          borderRadius: BorderRadius.circular(2),
          color: isActive ? BrandColors.gray_900 : BrandColors.gray_0,
        ),
        child: Text(
          '#${this.name}',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: isActive ? BrandColors.gray_0 : BrandColors.gray_400,
          ),
        ),
      ),
      onPressed: onPressed,
    );
  }
}
