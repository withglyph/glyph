import 'package:auto_route/auto_route.dart';
import 'package:card_swiper/card_swiper.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/heading.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/components/svg_icon.dart';
import 'package:glyph/components/svg_image.dart';
import 'package:glyph/extensions/color.dart';
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

  @override
  void initState() {
    super.initState();

    _headerAnimationController = AnimationController(
      vsync: this,
      duration: Duration.zero,
    );

    _headerBackgroundColorAnimation = ColorTween(
      begin: BrandColors.gray_0.withOpacity(0),
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
            bottomBorder: false,
            backgroundColor: _headerBackgroundColorAnimation.value,
            fallbackSystemUiOverlayStyle: SystemUiOverlayStyle.light,
            leading: SvgImage(
              'logos/full',
              width: 86,
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

          _headerAnimationController.value =
              clampDouble((-carouselBottomPosition + 50) / 50, 0, 1);

          return false;
        },
        child: SizedBox.expand(
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            child: Column(
              children: [
                ConstrainedBox(
                  constraints: const BoxConstraints.tightFor(height: 416),
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
                                padding: const EdgeInsets.fromLTRB(4, 2, 8, 2),
                                decoration: BoxDecoration(
                                  color: BrandColors.gray_900.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(30),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    ConstrainedBox(
                                      constraints:
                                          const BoxConstraints.tightFor(width: 13),
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
                                        color:
                                            BrandColors.gray_0.withOpacity(0.5),
                                      ),
                                    ),
                                    const Gap(2),
                                    Text(
                                      config.itemCount.toString(),
                                      style: TextStyle(
                                        fontSize: 11,
                                        color:
                                            BrandColors.gray_0.withOpacity(0.5),
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
                                    mainAxisAlignment: MainAxisAlignment.end,
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        carousel.title,
                                        style: const TextStyle(
                                          fontSize: 24,
                                          fontWeight: FontWeight.w800,
                                          color: BrandColors.gray_0,
                                        ),
                                      ),
                                      if (carousel.subtitle != null)
                                        Text(
                                          carousel.subtitle!,
                                          style: const TextStyle(
                                            fontSize: 16,
                                            color: BrandColors.gray_0,
                                          ),
                                        ),
                                      if (carousel.bottomline != null) ...[
                                        const Gap(4),
                                        Text(
                                          carousel.bottomline!,
                                          style: TextStyle(
                                            fontSize: 11,
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
                ...List.generate(
                  20,
                  (index) => Container(
                    height: 200,
                    color: BrandColors.gray_0,
                    child: Center(
                      child: Text('Post $index'),
                    ),
                  ),
                ),
              ],
            ),
          ),
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
