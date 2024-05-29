import 'package:auto_route/auto_route.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
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

  final _scrollController = ScrollController();
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
      begin: Colors.transparent,
      end: BrandColors.gray_0,
    ).animate(_headerAnimationController);

    _headerForegroundColorAnimation = ColorTween(
      begin: BrandColors.gray_0,
      end: BrandColors.gray_900,
    ).animate(_headerAnimationController);

    _scrollController.addListener(() {
      final box = _carouselKey.currentContext?.findRenderObject() as RenderBox;
      final offset = box.localToGlobal(Offset.zero);
      final safeAreaHeight = MediaQuery.of(context).padding.top;

      final carouselBottomPosition =
          offset.dy + box.size.height - 54 - safeAreaHeight;

      _headerAnimationController.value =
          clampDouble((-carouselBottomPosition + 50) / 50, 0, 1);
    });
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox.expand(
      child: Stack(
        fit: StackFit.passthrough,
        children: [
          SingleChildScrollView(
            controller: _scrollController,
            physics: const AlwaysScrollableScrollPhysics(),
            child: Column(
              mainAxisSize: MainAxisSize.max,
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
          Positioned(
            left: 0,
            right: 0,
            top: 0,
            child: AnimatedBuilder(
              animation: _headerAnimationController,
              builder: (context, child) {
                return Container(
                  color: _headerBackgroundColorAnimation.value,
                  child: SafeArea(
                    child: SizedBox(
                      height: 54,
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        child: Row(
                          children: [
                            SvgImage(
                              'logos/full',
                              width: 86,
                              color: _headerForegroundColorAnimation.value,
                            ),
                            const Spacer(),
                            Pressable(
                              child: Padding(
                                padding: const EdgeInsets.all(2),
                                child: SvgIcon(
                                  'search',
                                  color: _headerForegroundColorAnimation.value,
                                ),
                              ),
                              onPressed: () {
                                context.router
                                    .push(PlaceholderRoute(text: '검색'));
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
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
