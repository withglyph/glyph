import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_naver_login/flutter_naver_login.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:get_it/get_it.dart';
import 'package:glyph/components/button.dart';
import 'package:glyph/components/svg_image.dart';
import 'package:glyph/components/svg_icon.dart';
import 'package:glyph/graphql/__generated__/login_screen_authorize_single_sign_on_token_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/login_screen_query.req.gql.dart';
import 'package:glyph/graphql/__generated__/schema.schema.gql.dart';
import 'package:glyph/providers/auth.dart';
import 'package:glyph/providers/ferry.dart';
import 'package:glyph/themes/colors.dart';
import 'package:glyph/widgets/loading_indicator_dialog.dart';
import 'package:google_sign_in/google_sign_in.dart';

GoogleSignIn _googleSignIn = GoogleSignIn(
  clientId:
      '58678861052-lf5sv4oggv0ieiuitk9vnh6c6nmq2e4m.apps.googleusercontent.com',
  serverClientId:
      '58678861052-afsh5183jqgh7n1cv0gp5drctvdkfb1t.apps.googleusercontent.com',
);

@RoutePage()
class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<ConsumerStatefulWidget> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  var _isInitialized = false;
  String? _imageUrl;

  final loadingIndicatorDialog = GetIt.I<LoadingIndicatorDialog>();

  @override
  Widget build(BuildContext context) {
    final ferry = ref.watch(ferryProvider);

    final req = GLoginScreen_QueryReq();
    ferry.request(req).listen((resp) {
      if (_isInitialized) {
        return;
      }

      _imageUrl = resp.data?.featuredImage?.url;
      if (_imageUrl == null) {
        setState(() {
          _isInitialized = true;
        });
      } else {
        final networkImage = NetworkImage(_imageUrl!);
        precacheImage(networkImage, context).then((_) {
          setState(() {
            _isInitialized = true;
          });
        });
      }
    });

    return Scaffold(
      body: Container(
        decoration: _imageUrl != null
            ? BoxDecoration(
                image: DecorationImage(
                  image: NetworkImage(_imageUrl!),
                  alignment: Alignment.center,
                  fit: BoxFit.cover,
                  colorFilter: ColorFilter.mode(
                      Colors.black.withOpacity(0.4), BlendMode.srcATop),
                ),
              )
            : const BoxDecoration(color: BrandColors.gray_900),
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
                      style: TextStyle(fontSize: 16, color: BrandColors.gray_0),
                    ),
                  ],
                ),
              ),
              Button(
                style: const ButtonStyle(
                  foregroundColor: WidgetStatePropertyAll(BrandColors.gray_900),
                  backgroundColor: WidgetStatePropertyAll(BrandColors.gray_0),
                  minimumSize: WidgetStatePropertyAll(Size.fromHeight(48)),
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

                  await loadingIndicatorDialog.run(context, () async {
                    final req =
                        GLoginScreen_AuthorizeSingleSignOnToken_MutationReq(
                      (b) => b
                        ..vars.input.provider = GUserSingleSignOnProvider.GOOGLE
                        ..vars.input.token = authResult.serverAuthCode,
                    );

                    final resp = await ferry.request(req).first;
                    if (resp.hasErrors) {
                      return;
                    }

                    await ref.read(authProvider.notifier).setAccessToken(
                        resp.data!.authorizeSingleSignOnToken.token);
                  });
                },
              ),
              const Gap(11),
              Button(
                style: const ButtonStyle(
                  foregroundColor: WidgetStatePropertyAll(BrandColors.gray_900),
                  backgroundColor: WidgetStatePropertyAll(BrandColors.gray_0),
                  minimumSize: WidgetStatePropertyAll(Size.fromHeight(48)),
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
                  final token = await FlutterNaverLogin.currentAccessToken;

                  if (!token.isValid()) {
                    return;
                  }

                  if (!context.mounted) {
                    return;
                  }

                  await loadingIndicatorDialog.run(context, () async {
                    final req =
                        GLoginScreen_AuthorizeSingleSignOnToken_MutationReq(
                      (b) => b
                        ..vars.input.provider = GUserSingleSignOnProvider.NAVER
                        ..vars.input.token = token.accessToken,
                    );

                    final resp = await ferry.request(req).first;
                    if (resp.hasErrors) {
                      return;
                    }

                    await ref.read(authProvider.notifier).setAccessToken(
                        resp.data!.authorizeSingleSignOnToken.token);
                  });
                },
              ),
              const Gap(11),
              Button(
                style: const ButtonStyle(
                  foregroundColor: WidgetStatePropertyAll(BrandColors.gray_900),
                  backgroundColor: WidgetStatePropertyAll(BrandColors.gray_0),
                  minimumSize: WidgetStatePropertyAll(Size.fromHeight(48)),
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
      ),
    );
  }
}
