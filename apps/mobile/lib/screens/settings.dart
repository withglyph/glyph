import 'package:auto_route/auto_route.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/components/svg_icon.dart';
import 'package:glyph/components/toggle_switch.dart';
import 'package:glyph/context/loader.dart';
import 'package:glyph/ferry/extension.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/settings_screen_query.req.gql.dart';
import 'package:glyph/graphql/__generated__/settings_screen_update_user_marketing_consent_mutation.req.gql.dart';
import 'package:glyph/providers/auth.dart';
import 'package:glyph/providers/push_notification.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/shells/default.dart';
import 'package:glyph/themes/colors.dart';
import 'package:jiffy/jiffy.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:url_launcher/url_launcher.dart';

@RoutePage()
class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return DefaultShell(
      title: '설정',
      child: GraphQLOperation(
        operation: GSettingsScreen_QueryReq(),
        builder: (context, client, data) {
          return SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const _Section('계정'),
                _Item(title: '계정 / 정보 관리', onPressed: () {}),
                const Gap(40),
                const _Section('문의 및 안내'),
                _Item(
                  title: '고객센터',
                  onPressed: () {
                    launchUrl(
                      Uri.parse('https://penxle.channel.io'),
                      mode: LaunchMode.externalApplication,
                    );
                  },
                ),
                const Gap(40),
                const _Section('이벤트 알림 설정'),
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  child: Row(
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            '이벤트 및 글리프 소식 받아보기',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          if (data.me!.marketingConsent != null) ...[
                            const Gap(4),
                            Text(
                              Jiffy.parse(
                                data.me!.marketingConsent!.createdAt.value,
                              ).format(pattern: 'yyyy년 MM월 dd일 수신 동의'),
                              style: const TextStyle(
                                fontSize: 12,
                                color: BrandColors.gray_500,
                              ),
                            ),
                          ],
                        ],
                      ),
                      const Spacer(),
                      ToggleSwitch(
                        value: data.me!.marketingConsent != null,
                        onChanged: (value) async {
                          final req =
                              GSettingsScreen_UpdateUserMarketingConsent_MutationReq(
                            (b) => b..vars.input.consent = value,
                          );
                          await client.req(req);
                        },
                      ),
                    ],
                  ),
                ),
                const Gap(40),
                const _Section('서비스 정보'),
                _Item(
                  title: '이용약관',
                  onPressed: () {
                    launchUrl(
                      Uri.parse('https://help.withglyph.com/legal/terms'),
                      mode: LaunchMode.externalApplication,
                    );
                  },
                ),
                _Item(
                  title: '개인정보처리방침',
                  onPressed: () {
                    launchUrl(
                      Uri.parse('https://help.withglyph.com/legal/privacy'),
                      mode: LaunchMode.externalApplication,
                    );
                  },
                ),
                _Item(
                  title: '사업자 정보',
                  onPressed: () {
                    launchUrl(
                      Uri.parse(
                          'https://www.ftc.go.kr/bizCommPop.do?wrkr_no=6108803078'),
                      mode: LaunchMode.externalApplication,
                    );
                  },
                ),
                FutureBuilder(
                  future: PackageInfo.fromPlatform(),
                  builder: (context, snapshot) {
                    return _Item(
                      title: '버전 정보',
                      leading: Padding(
                        padding: const EdgeInsets.only(left: 6),
                        child: Text(
                          snapshot.hasData
                              ? '${snapshot.requireData.version} (${kReleaseMode ? snapshot.requireData.buildNumber : 'dev'})'
                              : '가져오는 중...',
                          style: const TextStyle(
                            fontSize: 13,
                            color: BrandColors.gray_500,
                          ),
                        ),
                      ),
                      trailing: const Text(
                        '최신 버전입니다',
                        style: TextStyle(
                          fontSize: 13,
                          color: BrandColors.gray_500,
                        ),
                      ),
                      onPressed: () {},
                    );
                  },
                ),
                _Item(
                  title: '오픈소스 라이센스',
                  onPressed: () {
                    context.router.push(const OssLicensesRoute());
                  },
                ),
                const Gap(60),
                Pressable(
                  child: Container(
                    height: 50,
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: BrandColors.gray_150,
                        width: 1,
                      ),
                      borderRadius: BorderRadius.circular(2),
                    ),
                    child: const Center(
                      child: Text(
                        '로그아웃',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                  onPressed: () async {
                    context.loader.run(() async {
                      await ref
                          .read(pushNotificationProvider.notifier)
                          .clearToken();
                      await ref.read(authProvider.notifier).clearAccessToken();
                    });
                  },
                ),
                const Gap(60),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _Section extends StatelessWidget {
  const _Section(this.title);

  final String title;

  @override
  Widget build(BuildContext context) {
    return Text(
      this.title,
      style: const TextStyle(
        fontSize: 12,
        fontWeight: FontWeight.w600,
        color: BrandColors.gray_400,
      ),
    );
  }
}

class _Item extends StatelessWidget {
  const _Item({
    required this.title,
    this.leading,
    this.trailing,
    required this.onPressed,
  });

  final String title;
  final Function() onPressed;
  final Widget? leading;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Pressable(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: const BoxDecoration(
          border: Border(
            bottom: BorderSide(
              color: BrandColors.gray_50,
              width: 1,
            ),
          ),
        ),
        child: Row(
          children: [
            Text(
              title,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
              ),
            ),
            if (leading != null) leading!,
            const Spacer(),
            trailing ??
                const SvgIcon(
                  'chevron-right',
                  size: 20,
                  color: BrandColors.gray_400,
                ),
          ],
        ),
      ),
      onPressed: onPressed,
    );
  }
}
