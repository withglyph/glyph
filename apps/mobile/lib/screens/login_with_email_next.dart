import 'package:auto_route/auto_route.dart';
import 'package:external_app_launcher/external_app_launcher.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/components/svg_image.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/shells/default.dart';
import 'package:glyph/themes/colors.dart';

@RoutePage()
class LoginWithEmailNextScreen extends ConsumerWidget {
  const LoginWithEmailNextScreen({
    required this.email,
    super.key,
  });

  final String email;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return DefaultShell(
      bottomBorder: false,
      useSafeArea: true,
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              '이메일 인증',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w700,
              ),
            ),
            const Gap(24),
            Text(
              '인증 이메일이 $email로 전송되었어요.',
              style: const TextStyle(fontSize: 16),
            ),
            const Text(
              '이메일을 열어 계속 진행해주세요.',
              style: TextStyle(fontSize: 16),
            ),
            const Spacer(),
            Pressable(
              child: Container(
                decoration: BoxDecoration(
                  color: BrandColors.gray_0,
                  border: Border.all(color: BrandColors.gray_200),
                ),
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 14,
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    SvgImage('icons/google', width: 18, height: 18),
                    Gap(10),
                    Text(
                      '구글 이메일 열기',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
              onPressed: () async {
                await LaunchApp.openApp(
                  androidPackageName: 'com.google.android.gm',
                  iosUrlScheme: 'googlegmail://',
                  appStoreLink: 'itms-apps://apps.apple.com/app/id422689480',
                  openStore: true,
                );
              },
            ),
            const Gap(11),
            Pressable(
              child: Container(
                decoration: BoxDecoration(
                  color: BrandColors.gray_0,
                  border: Border.all(color: BrandColors.gray_200),
                ),
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 14,
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    SvgImage('icons/naver', width: 16, height: 16),
                    Gap(10),
                    Text(
                      '네이버 이메일 열기',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
              onPressed: () async {
                await LaunchApp.openApp(
                  androidPackageName: 'com.nhn.android.mail',
                  iosUrlScheme: 'navermail://',
                  appStoreLink: 'itms-apps://apps.apple.com/app/id582152066',
                  openStore: true,
                );
              },
            ),
            const Gap(32),
            Pressable(
              child: const Text(
                '코드 입력하기',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 15,
                  color: BrandColors.gray_600,
                ),
              ),
              onPressed: () async {
                await context.router.push(LoginWithCodeRoute(email: email));
              },
            ),
          ],
        ),
      ),
    );
  }
}
