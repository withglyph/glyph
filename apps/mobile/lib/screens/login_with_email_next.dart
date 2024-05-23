import 'package:auto_route/auto_route.dart';
import 'package:external_app_launcher/external_app_launcher.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/components/svg_image.dart';
import 'package:glyph/ferry/extension.dart';
import 'package:glyph/graphql/__generated__/login_with_email_next_screen_authorize_user_email_token_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/login_with_email_next_screen_issue_user_email_authorization_token_mutation.req.gql.dart';
import 'package:glyph/providers/auth.dart';
import 'package:glyph/providers/ferry.dart';
import 'package:glyph/themes/colors.dart';

@RoutePage()
class LoginWithEmailNextScreen extends ConsumerStatefulWidget {
  const LoginWithEmailNextScreen({
    super.key,
    required this.email,
  });

  final String email;

  @override
  ConsumerState<ConsumerStatefulWidget> createState() =>
      _LoginWithEmailNextScreenState();
}

class _LoginWithEmailNextScreenState
    extends ConsumerState<LoginWithEmailNextScreen> {
  _Mode mode = _Mode.token;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: SafeArea(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text('이메일 인증',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.w700)),
              const Gap(4),
              Text('인증 메일이 ${widget.email}으로 전송되었어요',
                  style: const TextStyle(fontSize: 14)),
              if (mode == _Mode.token) ...[
                const Text('이메일을 열어 계속 진행해주세요', style: TextStyle(fontSize: 14)),
                const Gap(36),
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
                      appStoreLink:
                          'itms-apps://apps.apple.com/app/id422689480',
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
                      appStoreLink:
                          'itms-apps://apps.apple.com/app/id582152066',
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
                  onPressed: () {
                    setState(() {
                      mode = _Mode.code;
                    });
                  },
                )
              ],
              if (mode == _Mode.code) ...[
                const Text('받으신 이메일을 열어 코드 6자리를 입력해주세요',
                    style: TextStyle(fontSize: 14)),
                const Gap(32),
                TextField(
                  decoration: InputDecoration(
                    isDense: true,
                    filled: true,
                    fillColor: BrandColors.gray_0,
                    enabledBorder: OutlineInputBorder(
                      borderSide: const BorderSide(
                          color: BrandColors.gray_200, width: 1),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderSide: const BorderSide(
                          color: BrandColors.gray_600, width: 1),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 16,
                    ),
                    hintText: '코드를 입력해주세요',
                    hintStyle: const TextStyle(color: BrandColors.gray_400),
                  ),
                  onSubmitted: (value) async {
                    if (value.isNotEmpty) {
                      final client = ref.read(ferryProvider);
                      final req1 =
                          GLoginWithEmailNextScreen_IssueUserEmailAuthorizationToken_MutationReq(
                        (b) => b
                          ..vars.input.email = widget.email
                          ..vars.input.code = value,
                      );
                      final resp1 = await client.req(req1);

                      final req2 =
                          GLoginWithEmailNextScreen_AuthorizeUserEmailToken_MutationReq(
                        (b) => b
                          ..vars.input.email = widget.email
                          ..vars.input.token =
                              resp1.issueUserEmailAuthorizationToken.token,
                      );

                      final resp2 = await client.req(req2);
                      await ref
                          .read(authProvider.notifier)
                          .setAccessToken(resp2.authorizeUserEmailToken.token);
                    }
                  },
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

enum _Mode { token, code }
