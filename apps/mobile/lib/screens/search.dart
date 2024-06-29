import 'package:auto_route/auto_route.dart';
import 'package:card_swiper/card_swiper.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/heading.dart';
import 'package:glyph/extensions/color.dart';
import 'package:glyph/icons/glyph.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/shells/default.dart';
import 'package:glyph/themes/colors.dart';
import 'package:transparent_image/transparent_image.dart';

@RoutePage()
class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});

  @override
  createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  @override
  Widget build(BuildContext context) {
    return DefaultShell(
      appBar: Heading.empty(),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            child: TextField(
              textInputAction: TextInputAction.search,
              decoration: InputDecoration(
                isDense: true,
                filled: true,
                fillColor: BrandColors.gray_50,
                hintText: '검색어를 입력해주세요',
                hintStyle: const TextStyle(color: BrandColors.gray_400),
                prefixIcon: const Padding(
                  padding: EdgeInsets.fromLTRB(12, 11, 6, 11),
                  child: Icon(
                    Glyph.search,
                    size: 16,
                    color: BrandColors.gray_400,
                  ),
                ),
                prefixIconConstraints: BoxConstraints.tight(const Size(34, 38)),
                contentPadding: const EdgeInsets.symmetric(vertical: 8),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(30),
                  borderSide: BorderSide.none,
                ),
              ),
              style: const TextStyle(fontSize: 15),
            ),
          ),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            child: _Carousel(),
          ),
        ],
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
    backgroundImageUrl: 'https://glyph.pub/images/_/banner_twitter_events_2.png',
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
        duration: 500,
        curve: Curves.linearToEaseOut,
        itemCount: _carousels.length,
        itemBuilder: (context, index) {
          final carousel = _carousels[index];

          return Container(
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
