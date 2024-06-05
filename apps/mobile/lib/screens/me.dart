import 'package:auto_route/auto_route.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/heading.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/components/svg_icon.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/me_screen_query.req.gql.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/themes/colors.dart';
import 'package:sliver_tools/sliver_tools.dart';

@RoutePage()
class MeScreen extends ConsumerStatefulWidget {
  const MeScreen({super.key});

  @override
  ConsumerState<ConsumerStatefulWidget> createState() => _MeScreenState();
}

class _MeScreenState extends ConsumerState<MeScreen>
    with TickerProviderStateMixin {
  final _spaceHeaderKey = GlobalKey();

  late AnimationController _appBarAnimationController;
  late Animation<Color?> _appBarBackgroundColorAnimation;
  late Animation<Color?> _appBarForegroundColorAnimation;

  @override
  void initState() {
    super.initState();

    _appBarAnimationController = AnimationController(
      vsync: this,
      duration: Duration.zero,
    );

    _appBarBackgroundColorAnimation = ColorTween(
      begin: BrandColors.gray_900,
      end: BrandColors.gray_0,
    ).animate(_appBarAnimationController);

    _appBarForegroundColorAnimation = ColorTween(
      begin: BrandColors.gray_0,
      end: BrandColors.gray_900,
    ).animate(_appBarAnimationController);
  }

  @override
  Widget build(BuildContext context) {
    return GraphQLOperation(
      operation: GMeScreen_QueryReq(),
      builder: (context, client, data) {
        return Scaffold(
          backgroundColor: BrandColors.gray_900,
          appBar: Heading.animated(
            animation: _appBarAnimationController,
            builder: (context) {
              return Heading(
                bottomBorder: false,
                backgroundColor: _appBarBackgroundColorAnimation.value,
                actions: [
                  Pressable(
                    child: Padding(
                      padding: const EdgeInsets.all(2),
                      child: SvgIcon(
                        'notification',
                        color: _appBarForegroundColorAnimation.value,
                      ),
                    ),
                    onPressed: () {
                      context.router.push(const NotificationRoute());
                    },
                  ),
                  const Gap(18),
                  Pressable(
                    child: Padding(
                      padding: const EdgeInsets.all(2),
                      child: SvgIcon(
                        'settings',
                        color: _appBarForegroundColorAnimation.value,
                      ),
                    ),
                    onPressed: () {
                      context.router.push(const SettingsRoute());
                    },
                  ),
                ],
              );
            },
          ),
          body: NotificationListener<ScrollUpdateNotification>(
            onNotification: (notification) {
              final box = _spaceHeaderKey.currentContext?.findRenderObject()
                  as RenderBox;
              final offset = box.localToGlobal(Offset.zero);
              final safeAreaHeight = MediaQuery.of(context).padding.top;

              final spaceHeaderTopPosition = offset.dy - safeAreaHeight - 54;
              _appBarAnimationController.animateTo(
                clampDouble((-spaceHeaderTopPosition + 50) / 50, 0, 1),
              );

              return false;
            },
            child: CustomScrollView(
              slivers: [
                SliverToBoxAdapter(
                  child: Container(
                    color: BrandColors.gray_900,
                    padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
                    child: Column(
                      children: [
                        Row(
                          children: [
                            CircleAvatar(
                              radius: 30,
                              foregroundImage:
                                  NetworkImage(data.me!.profile.avatar.url),
                            ),
                            const Gap(6),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  data.me!.profile.name,
                                  style: const TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w600,
                                    color: BrandColors.gray_0,
                                  ),
                                ),
                                Text(
                                  data.me!.email,
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: BrandColors.gray_300,
                                  ),
                                ),
                              ],
                            )
                          ],
                        ),
                        const Gap(20),
                        Container(
                          height: 76,
                          color: const Color(0xFF424242),
                        ),
                      ],
                    ),
                  ),
                ),
                SliverPinnedHeader(
                  child: Container(
                    key: _spaceHeaderKey,
                    padding: const EdgeInsets.symmetric(
                        horizontal: 20, vertical: 12),
                    decoration: const BoxDecoration(
                      color: BrandColors.gray_0,
                      border: Border(
                        bottom: BorderSide(color: BrandColors.gray_150),
                      ),
                    ),
                    child: Row(
                      children: [
                        const Text(
                          '내 스페이스',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const Spacer(),
                        Pressable(
                          child: Container(
                            color: BrandColors.gray_50,
                            padding: const EdgeInsets.fromLTRB(6, 4, 8, 4),
                            child: const Row(
                              children: [
                                SvgIcon('plus',
                                    size: 16, color: BrandColors.gray_600),
                                Text(
                                  '만들기',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w500,
                                    color: BrandColors.gray_600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                SliverList.builder(
                  itemCount: 20,
                  itemBuilder: (context, index) {
                    return Container(
                      height: 80,
                      color: BrandColors.gray_0,
                      child: Center(
                        child: Text('Space $index'),
                      ),
                    );
                  },
                ),
                SliverFillRemaining(
                  hasScrollBody: false,
                  fillOverscroll: true,
                  child: Container(color: BrandColors.gray_0),
                )
              ],
            ),
          ),
        );
      },
    );
  }
}
