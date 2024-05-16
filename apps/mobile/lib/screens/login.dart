import 'package:ferry/ferry.dart';
import 'package:ferry_flutter/ferry_flutter.dart';
import 'package:flutter/material.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:gap/gap.dart';
import 'package:get_it/get_it.dart';
import 'package:glyph/components/button.dart';
import 'package:glyph/graphql/__generated__/login_screen_authorize_single_sign_on_token_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/login_screen_query.req.gql.dart';
import 'package:glyph/graphql/__generated__/schema.schema.gql.dart';
import 'package:glyph/signals.dart';
import 'package:glyph/themes/colors.dart';
import 'package:go_router/go_router.dart';
import 'package:google_sign_in/google_sign_in.dart';

GoogleSignIn _googleSignIn = GoogleSignIn(
  clientId:
      '58678861052-lf5sv4oggv0ieiuitk9vnh6c6nmq2e4m.apps.googleusercontent.com',
  serverClientId:
      '58678861052-afsh5183jqgh7n1cv0gp5drctvdkfb1t.apps.googleusercontent.com',
);

class LoginScreen extends StatelessWidget {
  LoginScreen({super.key});

  final client = GetIt.I<Client>();

  @override
  Widget build(BuildContext context) {
    return Operation(
      client: client,
      operationRequest: GLoginScreen_QueryReq(),
      builder: (context, response, error) {
        if (response == null || response.loading) {
          return Container();
        }

        final imageUrl = response.data?.authLayoutBackgroundImage?.url;
        NetworkImage? networkImage;

        if (imageUrl == null) {
          FlutterNativeSplash.remove();
        } else {
          networkImage = NetworkImage(imageUrl);
          precacheImage(networkImage, context).then((_) {
            FlutterNativeSplash.remove();
          });
        }

        return Container(
          decoration: networkImage != null
              ? BoxDecoration(
                  image: DecorationImage(
                    image: networkImage,
                    alignment: Alignment.center,
                    fit: BoxFit.cover,
                    colorFilter: ColorFilter.mode(
                      Colors.black.withOpacity(0.4),
                      BlendMode.srcATop,
                    ),
                  ),
                )
              : BoxDecoration(color: BrandColors.gray[900]),
          child: SafeArea(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Expanded(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        SvgPicture.asset(
                          'assets/logos/full.svg',
                          height: 38,
                          colorFilter: ColorFilter.mode(
                            BrandColors.gray[0]!,
                            BlendMode.srcIn,
                          ),
                        ),
                        const Gap(8),
                        Text(
                          '창작자를 위한 콘텐츠 플랫폼\n글리프에 오신 것을 환영해요!',
                          style: TextStyle(
                            fontSize: 16,
                            color: BrandColors.gray[0],
                          ),
                        ),
                      ],
                    ),
                  ),
                  Button(
                    style: ButtonStyle(
                      foregroundColor:
                          WidgetStatePropertyAll(BrandColors.gray[900]),
                      backgroundColor:
                          WidgetStatePropertyAll(BrandColors.gray[0]),
                      minimumSize:
                          const WidgetStatePropertyAll(Size.fromHeight(48)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        SvgPicture.asset(
                          'assets/icons/google.svg',
                          width: 18,
                          height: 18,
                        ),
                        const Gap(10),
                        const Text(
                          '구글로 시작하기',
                          style: TextStyle(fontSize: 16),
                        ),
                      ],
                    ),
                    onPressed: () async {
                      await _googleSignIn.disconnect();
                      final account = await _googleSignIn.signIn();
                      if (account == null) {
                        return;
                      }

                      final req =
                          GLoginScreen_AuthorizeSingleSignOnToken_MutationReq(
                        (b) => b
                          ..vars.input.provider =
                              GUserSingleSignOnProvider.GOOGLE
                          ..vars.input.token = account.serverAuthCode,
                      );

                      final resp = await client.request(req).first;
                      accessToken.value =
                          resp.data?.authorizeSingleSignOnToken.token;
                      GetIt.I.resetLazySingleton<Client>();

                      if (context.mounted) {
                        context.go('/');
                      }
                    },
                  ),
                  const Gap(11),
                  Button(
                    style: ButtonStyle(
                      foregroundColor:
                          WidgetStatePropertyAll(BrandColors.gray[900]),
                      backgroundColor:
                          WidgetStatePropertyAll(BrandColors.gray[0]),
                      minimumSize:
                          const WidgetStatePropertyAll(Size.fromHeight(48)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        SvgPicture.asset(
                          'assets/icons/naver.svg',
                          width: 16,
                          height: 16,
                        ),
                        const Gap(10),
                        const Text(
                          '네이버로 시작하기',
                          style: TextStyle(fontSize: 16),
                        ),
                      ],
                    ),
                  ),
                  const Gap(11),
                  Button(
                    style: ButtonStyle(
                      foregroundColor:
                          WidgetStatePropertyAll(BrandColors.gray[900]),
                      backgroundColor:
                          WidgetStatePropertyAll(BrandColors.gray[0]),
                      minimumSize:
                          const WidgetStatePropertyAll(Size.fromHeight(48)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        SvgPicture.asset(
                          'assets/icons/mail.svg',
                          width: 20,
                          height: 20,
                          colorFilter: ColorFilter.mode(
                            BrandColors.gray[900]!,
                            BlendMode.srcIn,
                          ),
                        ),
                        const Gap(10),
                        const Text(
                          '이메일로 시작하기',
                          style: TextStyle(fontSize: 16),
                        ),
                      ],
                    ),
                  ),
                  const Gap(32),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
