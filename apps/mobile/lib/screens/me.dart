import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/Img.dart';
import 'package:glyph/components/heading.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/extensions/int.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/me_screen_query.req.gql.dart';
import 'package:glyph/icons/tabler.dart';
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
          backgroundColor: BrandColors.gray_50,
          appBar: Heading.empty(),
          child: SizedBox.expand(
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(
                parent: BouncingScrollPhysics(),
              ),
              child: Column(
                children: [
                  Container(
                    color: BrandColors.gray_0,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 28,
                    ),
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
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Text(
                                    data.me!.profile.name,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                      fontSize: 22,
                                      fontWeight: FontWeight.w800,
                                    ),
                                  ),
                                  const Gap(6),
                                  const Icon(
                                    Tabler.chevron_right,
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
                        ],
                      ),
                      onPressed: () async {
                        await context.router.push(const ProfileRoute());
                      },
                    ),
                  ),
                  const Gap(6),
                  _Section(
                    children: [
                      _MenuItem(
                        icon: Tabler.planet,
                        title: '스페이스',
                        onPressed: () {},
                      ),
                      _MenuItem(
                        icon: Tabler.template,
                        title: '템플릿',
                        onPressed: () {},
                      ),
                      _MenuItem(
                        icon: Tabler.clipboard_text,
                        title: '임시보관함',
                        onPressed: () {},
                      ),
                    ],
                  ),
                  const Gap(6),
                  _Section(
                    children: [
                      _MenuItem(
                        icon: Tabler.coin,
                        title: '포인트',
                        trailing: Padding(
                          padding: const EdgeInsets.only(right: 6),
                          child: Text(
                            '${data.me!.point.comma}P',
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
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
                          await context.router.push(
                            WebViewRoute(
                              title: '수익/출금',
                              path: '/me/revenue',
                            ),
                          );
                        },
                      ),
                      _MenuItem(
                        icon: Tabler.scan,
                        title: '리딤코드',
                        onPressed: () {},
                      ),
                    ],
                  ),
                  const Gap(6),
                  _Section(
                    children: [
                      _MenuItem(
                        icon: Tabler.filter_cog,
                        title: '콘텐츠 필터링',
                        onPressed: () async {
                          await context.router.push(
                            WebViewRoute(
                              title: '콘텐츠 필터링',
                              path: '/me/contentfilters',
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                  const Gap(6),
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
                    ],
                  ),
                ],
              ),
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
    return Container(
      color: BrandColors.gray_0,
      padding: const EdgeInsets.symmetric(horizontal: 20),
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
        padding: const EdgeInsets.symmetric(vertical: 20),
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
              Tabler.chevron_right,
              size: 16,
              color: BrandColors.gray_400,
            ),
          ],
        ),
      ),
    );
  }
}
