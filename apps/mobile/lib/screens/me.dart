import 'dart:ui';

import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/heading.dart';
import 'package:glyph/components/horizontal_divider.dart';
import 'package:glyph/components/img.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/extensions/int.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/me_screen_query.req.gql.dart';
import 'package:glyph/icons/tabler.dart';
import 'package:glyph/icons/tabler_bold.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/shells/default.dart';
import 'package:glyph/themes/colors.dart';
import 'package:url_launcher/url_launcher.dart';

@RoutePage()
class MeScreen extends ConsumerStatefulWidget {
  const MeScreen({super.key});

  @override
  ConsumerState<ConsumerStatefulWidget> createState() => _MeScreenState();
}

class _MeScreenState extends ConsumerState<MeScreen> {
  @override
  Widget build(BuildContext context) {
    return GraphQLOperation(
      operation: GMeScreen_QueryReq(),
      builder: (context, client, data) {
        return DefaultShell(
          appBar: Heading.empty(backgroundColor: BrandColors.gray_0),
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(
              parent: BouncingScrollPhysics(),
            ),
            child: Column(
              children: [
                Padding(
                  padding: const Pad(horizontal: 20, vertical: 28),
                  child: Pressable(
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 27,
                          child: ClipOval(
                            child: Img(
                              data.me!.profile.avatar,
                              width: 54,
                              height: 54,
                            ),
                          ),
                        ),
                        const Gap(14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Flexible(
                                    child: Text(
                                      data.me!.profile.name,
                                      maxLines: 3,
                                      style: const TextStyle(
                                        fontSize: 22,
                                        fontWeight: FontWeight.w800,
                                      ),
                                    ),
                                  ),
                                  const Gap(6),
                                  const Icon(
                                    TablerBold.chevron_right,
                                    size: 16,
                                  ),
                                ],
                              ),
                              Text(
                                data.me!.email,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  fontSize: 14,
                                  color: BrandColors.gray_500,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    onPressed: () async {
                      await context.router.push(const ProfileRoute());
                    },
                  ),
                ),
                const HorizontalDivider(height: 6, color: BrandColors.gray_50),
                Padding(
                  padding: const Pad(horizontal: 20, vertical: 18),
                  child: Row(
                    children: [
                      const Icon(Tabler.planet, size: 20),
                      const Gap(8),
                      const Text(
                        '스페이스',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const Spacer(),
                      Pressable(
                        child: const Icon(
                          TablerBold.plus,
                          size: 16,
                          color: BrandColors.gray_400,
                        ),
                        onPressed: () {},
                      ),
                    ],
                  ),
                ),
                SizedBox(
                  height: 150,
                  child: data.me!.spaces.isEmpty
                      ? const Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              '아직 스페이스가 없어요',
                              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: BrandColors.gray_400),
                            ),
                            Gap(4),
                            Text(
                              '+ 아이콘을 눌러 스페이스를 만들어보세요',
                              style: TextStyle(fontSize: 13, color: BrandColors.gray_400),
                            ),
                          ],
                        )
                      : ListView.separated(
                          physics: const AlwaysScrollableScrollPhysics(
                            parent: BouncingScrollPhysics(),
                          ),
                          scrollDirection: Axis.horizontal,
                          padding: const Pad(horizontal: 20),
                          clipBehavior: Clip.none,
                          itemCount: data.me!.spaces.length,
                          itemBuilder: (context, index) {
                            final space = data.me!.spaces[index];

                            return Pressable(
                              child: Container(
                                width: 150,
                                decoration: BoxDecoration(
                                  color: BrandColors.gray_0,
                                  borderRadius: BorderRadius.circular(4),
                                  boxShadow: [
                                    BoxShadow(
                                      color: BrandColors.gray_900.withOpacity(0.1),
                                      offset: const Offset(1, 1),
                                      blurRadius: 8,
                                    ),
                                  ],
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.stretch,
                                  children: [
                                    Stack(
                                      children: [
                                        Container(
                                          height: 100,
                                          clipBehavior: Clip.antiAlias,
                                          decoration: const BoxDecoration(
                                            color: BrandColors.gray_50,
                                            borderRadius: BorderRadius.vertical(top: Radius.circular(4)),
                                          ),
                                          child: ColorFiltered(
                                            colorFilter: ColorFilter.mode(
                                              BrandColors.gray_900.withOpacity(0.05),
                                              BlendMode.srcATop,
                                            ),
                                            child: ImageFiltered(
                                              imageFilter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
                                              child: Img(space.icon, width: 150, height: 100),
                                            ),
                                          ),
                                        ),
                                        Positioned(
                                          left: 10,
                                          bottom: 12,
                                          child: Stack(
                                            clipBehavior: Clip.none,
                                            children: [
                                              Img(space.icon, width: 32, height: 32, borderWidth: 1),
                                              Positioned(
                                                right: -4,
                                                bottom: -4,
                                                child: Img(
                                                  space.meAsMember!.profile.avatar,
                                                  width: 20,
                                                  height: 20,
                                                  borderWidth: 1,
                                                  borderRadius: 10,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                    Expanded(
                                      child: Padding(
                                        padding: const Pad(horizontal: 10, vertical: 6),
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              space.name,
                                              overflow: TextOverflow.ellipsis,
                                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                                            ),
                                            Text(
                                              'by ${space.meAsMember!.profile.name}',
                                              overflow: TextOverflow.ellipsis,
                                              style: const TextStyle(fontSize: 11, color: BrandColors.gray_500),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              onPressed: () async {
                                await context.router.push(SpaceRoute(slug: space.slug));
                              },
                            );
                          },
                          separatorBuilder: (context, index) => const Gap(12),
                        ),
                ),
                const Gap(20),
                const HorizontalDivider(color: BrandColors.gray_50),
                _Section(
                  children: [
                    _MenuItem(
                      icon: Tabler.clipboard_text,
                      title: '임시보관함',
                      onPressed: () {},
                    ),
                  ],
                ),
                const HorizontalDivider(height: 6, color: BrandColors.gray_50),
                _Section(
                  children: [
                    _MenuItem(
                      icon: Tabler.coin,
                      title: '포인트',
                      trailing: Padding(
                        padding: const Pad(right: 6),
                        child: Text(
                          '${data.me!.point.comma}P',
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: BrandColors.gray_400,
                          ),
                        ),
                      ),
                      onPressed: () async {
                        await context.router.push(const PointRoute());
                      },
                    ),
                    _MenuItem(
                      icon: Tabler.pig_money,
                      title: '수익/출금',
                      onPressed: () async {
                        await context.router.push(const RevenueRoute());
                      },
                    ),
                    _MenuItem(
                      icon: Tabler.scan,
                      title: '리딤코드',
                      onPressed: () async {
                        await context.router.push(
                          const RedeemRoute(),
                        );
                      },
                    ),
                  ],
                ),
                const HorizontalDivider(height: 6, color: BrandColors.gray_50),
                _Section(
                  children: [
                    _MenuItem(
                      icon: Tabler.filter_cog,
                      title: '컨텐츠 필터링',
                      onPressed: () async {
                        await context.router.push(const ContentFiltersRoute());
                      },
                    ),
                  ],
                ),
                const HorizontalDivider(height: 6, color: BrandColors.gray_50),
                _Section(
                  children: [
                    _MenuItem(
                      icon: Tabler.settings,
                      title: '설정',
                      onPressed: () async {
                        await context.router.push(const SettingsRoute());
                      },
                    ),
                    _MenuItem(
                      icon: Tabler.headset,
                      title: '고객센터',
                      onPressed: () async {
                        await launchUrl(
                          Uri.parse('https://penxle.channel.io'),
                          mode: LaunchMode.externalApplication,
                        );
                      },
                    ),
                    _MenuItem(
                      icon: Tabler.sparkles,
                      title: '큐레이션',
                      onPressed: () async {
                        await context.router.push(const OnboardingCurationRoute());
                      },
                    ),
                  ],
                ),
                const Gap(80),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _Section extends StatelessWidget {
  const _Section({required this.children});

  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const Pad(horizontal: 20),
      child: Column(
        children: children,
      ),
    );
  }
}

class _MenuItem extends StatelessWidget {
  const _MenuItem({
    required this.icon,
    required this.title,
    required this.onPressed,
    this.trailing,
  });

  final IconData icon;
  final String title;
  final Widget? trailing;
  final Function() onPressed;

  @override
  Widget build(BuildContext context) {
    return Pressable(
      onPressed: onPressed,
      child: Padding(
        padding: const Pad(vertical: 18),
        child: Row(
          children: [
            Icon(icon, size: 20),
            const Gap(8),
            Text(
              title,
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w600,
              ),
            ),
            const Spacer(),
            if (trailing != null) trailing!,
            const Icon(
              TablerBold.chevron_right,
              size: 16,
              color: BrandColors.gray_400,
            ),
          ],
        ),
      ),
    );
  }
}
