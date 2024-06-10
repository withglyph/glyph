import 'package:auto_route/auto_route.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/heading.dart';
import 'package:glyph/components/horizontal_divider.dart';
import 'package:glyph/components/post_card.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/components/svg_icon.dart';
import 'package:glyph/ferry/extension.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/tag_screen_follow_tag_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/tag_screen_query.req.gql.dart';
import 'package:glyph/graphql/__generated__/tag_screen_unfollow_tag_mutation.req.gql.dart';
import 'package:glyph/themes/colors.dart';

@RoutePage()
class TagScreen extends StatefulWidget {
  const TagScreen({super.key, required this.name});

  final String name;

  @override
  createState() => _TagScreenState();
}

class _TagScreenState extends State<TagScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _appBarAnimationController;
  late Animation<Color?> _appBarBackgroundColorAnimation;
  late Animation<Color?> _appBarForegroundColorAnimation;

  final _key = GlobalKey();
  bool _showTitle = false;

  @override
  void initState() {
    super.initState();

    _appBarAnimationController = AnimationController(
      vsync: this,
      duration: Duration.zero,
    );

    _appBarBackgroundColorAnimation = ColorTween(
      begin: null,
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
      operation: GTagScreen_QueryReq(
        (b) => b..vars.name = widget.name,
      ),
      builder: (context, client, data) {
        final safeAreaHeight = MediaQuery.of(context).padding.top;

        return Scaffold(
          extendBodyBehindAppBar: true,
          appBar: Heading.animated(
            animation: _appBarAnimationController,
            builder: (context) {
              return Heading(
                backgroundColor: _appBarBackgroundColorAnimation.value,
                bottomBorder: _showTitle,
                titleOnLeft: true,
                fallbackSystemUiOverlayStyle: SystemUiOverlayStyle.light,
                leadingColor: _appBarForegroundColorAnimation.value,
                title: _showTitle
                    ? Text(
                        '#${data.tag.name}',
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      )
                    : null,
                actions: [
                  SvgIcon(
                    'dots-vertical',
                    color: _appBarForegroundColorAnimation.value,
                  ),
                ],
              );
            },
          ),
          body: NotificationListener<ScrollUpdateNotification>(
            onNotification: (notification) {
              final box = _key.currentContext!.findRenderObject() as RenderBox;
              final offset = box.localToGlobal(Offset.zero);
              final safeAreaHeight = MediaQuery.of(context).padding.top;
              final spaceHeaderTopPosition = offset.dy - safeAreaHeight - 44;
              final value =
                  clampDouble((-spaceHeaderTopPosition + 50) / 50, 0, 1);

              _appBarAnimationController.animateTo(value);

              setState(() {
                _showTitle = value >= 1;
              });

              return false;
            },
            child: CustomScrollView(
              slivers: [
                SliverToBoxAdapter(
                  child: Column(
                    children: [
                      Container(
                        height: 215 + safeAreaHeight,
                        padding: EdgeInsets.only(top: safeAreaHeight),
                        decoration: const BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              Color(0xFF323232),
                              BrandColors.gray_900,
                            ],
                            begin: Alignment.centerLeft,
                            end: Alignment.centerRight,
                          ),
                        ),
                        child: Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                '#${data.tag.name}',
                                style: const TextStyle(
                                  color: BrandColors.gray_0,
                                  fontSize: 20,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const Gap(4),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(
                                    '포스트 ${data.tag.postCount}개',
                                    style: const TextStyle(
                                      color: BrandColors.gray_300,
                                      fontSize: 12,
                                    ),
                                  ),
                                  const Gap(6),
                                  Container(
                                    width: 1,
                                    height: 9,
                                    color: const Color(0xFF4B4B4B),
                                  ),
                                  const Gap(6),
                                  Text(
                                    '구독자 ${data.tag.followerCount}명',
                                    style: const TextStyle(
                                      color: BrandColors.gray_300,
                                      fontSize: 12,
                                    ),
                                  ),
                                ],
                              ),
                              const Gap(24),
                              Pressable(
                                child: Container(
                                  width: 68,
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 12,
                                    vertical: 6,
                                  ),
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(2),
                                    color: data.tag.followed
                                        ? BrandColors.gray_0
                                        : BrandColors.brand_400,
                                  ),
                                  child: Center(
                                    child: Text(
                                      data.tag.followed ? '구독중' : '구독',
                                      style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w500,
                                        color: data.tag.followed
                                            ? BrandColors.gray_900
                                            : BrandColors.gray_0,
                                      ),
                                    ),
                                  ),
                                ),
                                onPressed: () async {
                                  if (data.tag.followed) {
                                    final req =
                                        GTagScreen_UnfollowTag_MutationReq(
                                      (b) => b..vars.input.tagId = data.tag.id,
                                    );
                                    await client.req(req);
                                  } else {
                                    final req =
                                        GTagScreen_FollowTag_MutationReq(
                                      (b) => b..vars.input.tagId = data.tag.id,
                                    );
                                    await client.req(req);
                                  }
                                },
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                SliverToBoxAdapter(
                  child: Padding(
                    key: _key,
                    padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                    child: Text(
                      '태그 검색 결과 ${data.tag.postCount}건',
                      style: const TextStyle(
                        color: BrandColors.gray_500,
                        fontSize: 13,
                      ),
                    ),
                  ),
                ),
                SliverList.separated(
                  itemCount: data.tag.posts.length,
                  itemBuilder: (context, index) {
                    final post = data.tag.posts[index];

                    return PostCard(
                      post,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 20,
                        vertical: 18,
                      ),
                    );
                  },
                  separatorBuilder: (context, index) {
                    return const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 20),
                      child: HorizontalDivider(color: BrandColors.gray_50),
                    );
                  },
                ),
                const SliverGap(60),
              ],
            ),
          ),
        );
      },
    );
  }
}
