import 'package:auto_route/auto_route.dart';
import 'package:external_app_launcher/external_app_launcher.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/button.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/components/svg_image.dart';
import 'package:glyph/context/bottom_menu.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/shells/default.dart';
import 'package:glyph/themes/colors.dart';

@RoutePage()
class LoginWithEmailNextScreen extends StatelessWidget {
  const LoginWithEmailNextScreen({
    required this.email,
    super.key,
  });

  final String email;

  @override
  Widget build(BuildContext context) {
    return DefaultShell(
      bottomBorder: false,
      useSafeArea: true,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              '이메일이 전송되었어요',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w700,
              ),
            ),
            const Gap(5),
            Text(
              '인증 이메일이 $email로 전송되었어요.\n이메일에 있는 링크를 눌러 계속 진행해주세요.',
              style: const TextStyle(fontSize: 14, color: BrandColors.gray_600),
            ),
            const Spacer(),
            Pressable(
              child: const Text(
                '코드 입력하기',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: BrandColors.gray_600,
                ),
              ),
              onPressed: () async {
                await context.router.push(LoginWithCodeRoute(email: email));
              },
            ),
            const Gap(20),
            Button(
              '이메일 앱 열기',
              size: ButtonSize.large,
              onPressed: () async {
                await context.showBottomMenu(
                  title: '이메일 앱 선택',
                  items: [
                    RawBottomMenuItem(
                      child: const Row(
                        children: [
                          SvgImage('icons/google', width: 18, height: 18),
                          Gap(14),
                          Text(
                            '구글 이메일 열기',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                      onTap: () async {
                        await LaunchApp.openApp(
                          androidPackageName: 'com.google.android.gm',
                          iosUrlScheme: 'googlegmail://',
                          appStoreLink: 'itms-apps://apps.apple.com/app/id422689480',
                          openStore: true,
                        );
                      },
                    ),
                    RawBottomMenuItem(
                      child: const Row(
                        children: [
                          Gap(1),
                          SvgImage('icons/naver', width: 16, height: 16, color: Color(0xFF03C75A)),
                          Gap(15),
                          Text(
                            '네이버 이메일 열기',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                      onTap: () async {
                        await LaunchApp.openApp(
                          androidPackageName: 'com.nhn.android.mail',
                          iosUrlScheme: 'navermail://',
                          appStoreLink: 'itms-apps://apps.apple.com/app/id582152066',
                          openStore: true,
                        );
                      },
                    ),
                  ],
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
