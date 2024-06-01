import 'package:auto_route/auto_route.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/heading.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/components/svg_icon.dart';
import 'package:glyph/components/svg_image.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/themes/colors.dart';

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
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: Heading.animated(
        animation: _headerAnimationController,
        builder: (context) {
          return Heading(
            backgroundColor: _headerBackgroundColorAnimation.value,
            fallbackSystemUiOverlayStyle: SystemUiOverlayStyle.light,
            leading: SvgImage(
              'logos/full',
              width: 86,
              color: _headerForegroundColorAnimation.value,
            ),
            actions: [
              Pressable(
                child: Padding(
                  padding: const EdgeInsets.all(2),
                  child: SvgIcon(
                    'search',
                    color: _headerForegroundColorAnimation.value,
                  ),
                ),
                onPressed: () {
                  context.router.push(PlaceholderRoute(text: '검색'));
                },
              ),
              const Gap(18),
              Pressable(
                child: Padding(
                  padding: const EdgeInsets.all(2),
                  child: SvgIcon(
                    'notification',
                    color: _headerForegroundColorAnimation.value,
                  ),
                ),
                onPressed: () {
                  context.router.push(const NotificationRoute());
                },
              ),
            ],
          );
        },
      ),
      body: NotificationListener<ScrollNotification>(
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
                Image.network(
                  key: _carouselKey,
                  'https://glyph.pub/images/_/banner_twitter_events_2.png',
                  height: 416,
                  fit: BoxFit.cover,
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
