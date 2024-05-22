import 'package:auto_route/auto_route.dart';
import 'package:ferry_flutter/ferry_flutter.dart';
import 'package:flutter/material.dart';
import 'package:flutter_naver_login/flutter_naver_login.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/button.dart';
import 'package:glyph/components/svg_image.dart';
import 'package:glyph/components/svg_icon.dart';
import 'package:glyph/context/loader.dart';
import 'package:glyph/graphql/__generated__/login_screen_authorize_single_sign_on_token_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/login_screen_query.req.gql.dart';
import 'package:glyph/graphql/__generated__/schema.schema.gql.dart';
import 'package:glyph/providers/auth.dart';
import 'package:glyph/providers/ferry.dart';
import 'package:glyph/themes/colors.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:transparent_image/transparent_image.dart';

GoogleSignIn _googleSignIn = GoogleSignIn(
  clientId:
      '58678861052-lf5sv4oggv0ieiuitk9vnh6c6nmq2e4m.apps.googleusercontent.com',
  serverClientId:
      '58678861052-afsh5183jqgh7n1cv0gp5drctvdkfb1t.apps.googleusercontent.com',
);

@RoutePage()
class LoginScreen extends ConsumerWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ferry = ref.watch(ferryProvider);

    return Operation(
      client: ferry,
      operationRequest: GLoginScreen_QueryReq(),
      builder: (context, response, error) {
        final imageUrl = response?.data?.featuredImage?.url;

        return Scaffold(
          body: Stack(
            children: [
              const SizedBox.expand(
                child: DecoratedBox(
                  decoration: BoxDecoration(color: BrandColors.gray_900),
                ),
              ),
              if (imageUrl != null)
                FadeInImage(
                  placeholder: MemoryImage(kTransparentImage),
                  image: NetworkImage(imageUrl),
                  width: double.infinity,
                  height: double.infinity,
                  alignment: Alignment.center,
                  fit: BoxFit.cover,
                  fadeInDuration: const Duration(milliseconds: 150),
                  color: Colors.black.withOpacity(0.4),
                  colorBlendMode: BlendMode.srcATop,
                ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: SafeArea(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Expanded(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            SvgImage('logos/full',
                                height: 38, color: BrandColors.gray_0),
                            Gap(8),
                            Text(
                              '창작자를 위한 콘텐츠 플랫폼\n글리프에 오신 것을 환영해요!',
                              style: TextStyle(
                                  fontSize: 16, color: BrandColors.gray_0),
                            ),
                          ],
                        ),
                      ),
                      Button(
                        style: const ButtonStyle(
                          foregroundColor:
                              WidgetStatePropertyAll(BrandColors.gray_900),
                          backgroundColor:
                              WidgetStatePropertyAll(BrandColors.gray_0),
                          minimumSize:
                              WidgetStatePropertyAll(Size.fromHeight(48)),
                        ),
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            SvgImage('icons/google', width: 18, height: 18),
                            Gap(10),
                            Text('구글로 시작하기', style: TextStyle(fontSize: 16)),
                          ],
                        ),
                        onPressed: () async {
                          await _googleSignIn.signOut();
                          final authResult = await _googleSignIn.signIn();
                          if (authResult == null) {
                            return;
                          }

                          if (!context.mounted) {
                            return;
                          }

                          await context.loader.run(() async {
                            final req =
                                GLoginScreen_AuthorizeSingleSignOnToken_MutationReq(
                              (b) => b
                                ..vars.input.provider =
                                    GUserSingleSignOnProvider.GOOGLE
                                ..vars.input.token = authResult.serverAuthCode,
                            );

                            final resp = await ferry.request(req).first;
                            if (resp.hasErrors) {
                              return;
                            }

                            await ref
                                .read(authProvider.notifier)
                                .setAccessToken(resp
                                    .data!.authorizeSingleSignOnToken.token);
                          });
                        },
                      ),
                      const Gap(11),
                      Button(
                        style: const ButtonStyle(
                          foregroundColor:
                              WidgetStatePropertyAll(BrandColors.gray_900),
                          backgroundColor:
                              WidgetStatePropertyAll(BrandColors.gray_0),
                          minimumSize:
                              WidgetStatePropertyAll(Size.fromHeight(48)),
                        ),
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            SvgImage('icons/naver', width: 16, height: 16),
                            Gap(10),
                            Text('네이버로 시작하기', style: TextStyle(fontSize: 16)),
                          ],
                        ),
                        onPressed: () async {
                          await FlutterNaverLogin.logOut();
                          await FlutterNaverLogin.logIn();
                          final token =
                              await FlutterNaverLogin.currentAccessToken;

                          if (!token.isValid()) {
                            return;
                          }

                          if (!context.mounted) {
                            return;
                          }

                          await context.loader.run(() async {
                            final req =
                                GLoginScreen_AuthorizeSingleSignOnToken_MutationReq(
                              (b) => b
                                ..vars.input.provider =
                                    GUserSingleSignOnProvider.NAVER
                                ..vars.input.token = token.accessToken,
                            );

                            final resp = await ferry.request(req).first;
                            if (resp.hasErrors) {
                              return;
                            }

                            await ref
                                .read(authProvider.notifier)
                                .setAccessToken(resp
                                    .data!.authorizeSingleSignOnToken.token);
                          });
                        },
                      ),
                      const Gap(11),
                      Button(
                        style: const ButtonStyle(
                          foregroundColor:
                              WidgetStatePropertyAll(BrandColors.gray_900),
                          backgroundColor:
                              WidgetStatePropertyAll(BrandColors.gray_0),
                          minimumSize:
                              WidgetStatePropertyAll(Size.fromHeight(48)),
                        ),
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            SvgIcon('mail', size: 20),
                            Gap(10),
                            Text(
                              '이메일로 시작하기',
                              style: TextStyle(fontSize: 16),
                            ),
                          ],
                        ),
                        onPressed: () {
                          // ! Implement it
                        },
                      ),
                      const Gap(32),
                    ],
                  ),
                ),
              )
            ],
          ),
        );
      },
    );
  }
}
