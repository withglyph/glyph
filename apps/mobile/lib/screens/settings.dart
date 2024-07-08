import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:auto_route/auto_route.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:get_it/get_it.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/components/toggle_switch.dart';
import 'package:glyph/context/alert.dart';
import 'package:glyph/context/loader.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/settings_screen_query.req.gql.dart';
import 'package:glyph/graphql/__generated__/settings_screen_update_user_marketing_consent_mutation.req.gql.dart';
import 'package:glyph/icons/tabler.dart';
import 'package:glyph/providers/auth.dart';
import 'package:glyph/providers/push_notification.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/shells/default.dart';
import 'package:glyph/themes/colors.dart';
import 'package:jiffy/jiffy.dart';
import 'package:mixpanel_flutter/mixpanel_flutter.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:url_launcher/url_launcher.dart';

@RoutePage()
class SettingsScreen extends ConsumerWidget {
  SettingsScreen({super.key});

  final _mixpanel = GetIt.I<Mixpanel>();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return DefaultShell(
      title: '설정',
      child: GraphQLOperation(
        operation: GSettingsScreen_QueryReq(),
        builder: (context, client, data) {
          return SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(
              parent: BouncingScrollPhysics(),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const Pad(horizontal: 20, top: 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const _Section('계정 / 정보관리'),
                      _Item(
                        title: '이메일 변경',
                        onPressed: () async {
                          await context.router.push(const EmailRoute());
                        },
                      ),
                      _Item(
                        title: '본인인증',
                        onPressed: () async {
                          await context.router.push(IdentificationRoute());
                        },
                      ),
                    ],
                  ),
                ),
                const Box(width: double.infinity, height: 6, color: BrandColors.gray_50),
                Padding(
                  padding: const Pad(horizontal: 20, top: 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const _Section('이벤트 알림 설정'),
                      Padding(
                        padding: const Pad(top: 16, bottom: 18),
                        child: Row(
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  '이벤트 및 글리프 소식 받아보기',
                                  style: TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                if (data.me!.marketingConsent != null) ...[
                                  const Gap(4),
                                  Text(
                                    Jiffy.parse(
                                      data.me!.marketingConsent!.createdAt.value,
                                      isUtc: true,
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
                                _mixpanel.track('user:marketing_consent:update', properties: {'consent': value});

                                final req = GSettingsScreen_UpdateUserMarketingConsent_MutationReq(
                                  (b) => b..vars.input.consent = value,
                                );
                                final resp = await client.request(req);

                                if (context.mounted && value) {
                                  await context.showAlert(
                                    title: '글리프 마케팅 수신동의',
                                    content: '${Jiffy.parse(
                                      resp.updateUserMarketingConsent.marketingConsent!.createdAt.value,
                                      isUtc: true,
                                    ).format(pattern: 'yyyy.MM.dd')} 동의처리 되었어요',
                                  );
                                }
                              },
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const Box(width: double.infinity, height: 6, color: BrandColors.gray_50),
                Padding(
                  padding: const Pad(horizontal: 20, top: 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const _Section('서비스 정보'),
                      _Item(
                        title: '이용약관',
                        onPressed: () async {
                          await launchUrl(
                            Uri.parse('https://help.withglyph.com/legal/terms'),
                            mode: LaunchMode.inAppBrowserView,
                          );
                        },
                      ),
                      _Item(
                        title: '개인정보처리방침',
                        onPressed: () async {
                          await launchUrl(
                            Uri.parse('https://help.withglyph.com/legal/privacy'),
                            mode: LaunchMode.inAppBrowserView,
                          );
                        },
                      ),
                      _Item(
                        title: '사업자 정보',
                        onPressed: () async {
                          await launchUrl(
                            Uri.parse('https://www.ftc.go.kr/bizCommPop.do?wrkr_no=6108803078'),
                            mode: LaunchMode.inAppBrowserView,
                          );
                        },
                      ),
                      _Item(
                        title: '오픈소스 라이센스',
                        onPressed: () async {
                          await context.router.push(const OssLicensesRoute());
                        },
                      ),
                      FutureBuilder(
                        // ignore: discarded_futures
                        future: PackageInfo.fromPlatform(),
                        builder: (context, snapshot) {
                          return _Item(
                            title: '버전 정보',
                            leading: Padding(
                              padding: const Pad(left: 6),
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
                            trailing: const SizedBox.shrink(),
                            onPressed: () {},
                          );
                        },
                      ),
                    ],
                  ),
                ),
                const Box(width: double.infinity, height: 6, color: BrandColors.gray_50),
                Padding(
                  padding: const Pad(all: 20, bottom: 4),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const _Section('기타'),
                      _Item(
                        title: '로그아웃',
                        onPressed: () async {
                          await context.loader.run(() async {
                            await ref.read(pushNotificationProvider.notifier).clearToken();
                            await ref.read(authProvider.notifier).clearAccessToken();
                          });
                        },
                        trailing: const SizedBox.shrink(),
                      ),
                      _Item(
                        title: '회원탈퇴',
                        onPressed: () async {
                          if (context.mounted) {
                            await context.router.push(const DeactivateRoute());
                          }
                        },
                      ),
                    ],
                  ),
                ),
                const Gap(80),
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
      title,
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
    required this.onPressed,
    this.leading,
    this.trailing,
  });

  final String title;
  final Function() onPressed;
  final Widget? leading;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Pressable(
      onPressed: onPressed,
      child: Padding(
        padding: const Pad(vertical: 18),
        child: Row(
          children: [
            Text(
              title,
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w600,
              ),
            ),
            if (leading != null) leading!,
            const Spacer(),
            trailing ??
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
