import 'dart:async';
import 'dart:io';

import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:auto_route/auto_route.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_naver_login/flutter_naver_login.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/btn.dart';
import 'package:glyph/components/heading.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/components/svg_image.dart';
import 'package:glyph/context/bottom_sheet.dart';
import 'package:glyph/context/loader.dart';
import 'package:glyph/extensions/build_context.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/login_screen_authorize_single_sign_on_token_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/login_screen_query.req.gql.dart';
import 'package:glyph/graphql/__generated__/schema.schema.gql.dart';
import 'package:glyph/providers/auth.dart';
import 'package:glyph/providers/ferry.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/themes/colors.dart';
import 'package:glyph/widgets/signup.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';
import 'package:transparent_image/transparent_image.dart';

@RoutePage()
class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> with SingleTickerProviderStateMixin {
  late final AnimationController _animationController;
  late final Animation<Alignment> _alignmentAnimation;

  @override
  void initState() {
    super.initState();

    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(minutes: 20),
    )..repeat();

    _alignmentAnimation = AlignmentTween(
      begin: Alignment.centerLeft,
      end: Alignment.centerRight,
    ).animate(_animationController);
  }

  @override
  void dispose() {
    _animationController.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: BrandColors.gray_900,
      resizeToAvoidBottomInset: false,
      extendBodyBehindAppBar: true,
      appBar: Heading.empty(systemUiOverlayStyle: SystemUiOverlayStyle.light),
      body: Stack(
        children: [
          GraphQLOperation(
            operation: GLoginScreen_QueryReq(),
            builder: (context, client, data) {
              return Positioned.fill(
                child: AnimatedBuilder(
                  animation: _animationController,
                  builder: (context, child) {
                    return UnconstrainedBox(
                      constrainedAxis: Axis.vertical,
                      clipBehavior: Clip.hardEdge,
                      alignment: _alignmentAnimation.value,
                      child: child,
                    );
                  },
                  child: Row(
                    children: data.featuredImages
                        .map(
                          (image) => FadeInImage(
                            placeholder: MemoryImage(kTransparentImage),
                            image: CachedNetworkImageProvider(image.url),
                            height: double.infinity,
                            fit: BoxFit.cover,
                            fadeInDuration: const Duration(milliseconds: 1000),
                          ),
                        )
                        .toList(),
                  ),
                ),
              );
            },
          ),
          const Positioned.fill(
            child: DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment(-1 / 3, -1),
                  end: Alignment(1 / 3, 1),
                  colors: [
                    Color(0xB3171717),
                    Color(0x26D1D1D1),
                  ],
                ),
              ),
            ),
          ),
          SafeArea(
            maintainBottomViewPadding: true,
            child: Padding(
              padding: const Pad(horizontal: 32, top: 60, bottom: 40),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    '이야기가 모여\n즐거움이\n되다',
                    style: TextStyle(
                      height: 1.34,
                      fontSize: 32,
                      fontWeight: FontWeight.w800,
                      color: BrandColors.gray_0,
                    ),
                  ),
                  const Spacer(),
                  Btn(
                    '시작하기',
                    size: BtnSize.large,
                    onPressed: () async {
                      await context.showBottomSheet(
                        builder: (context) => _BottomSheet(),
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

GoogleSignIn _googleSignIn = GoogleSignIn(
  clientId: '58678861052-lf5sv4oggv0ieiuitk9vnh6c6nmq2e4m.apps.googleusercontent.com',
  serverClientId: '58678861052-afsh5183jqgh7n1cv0gp5drctvdkfb1t.apps.googleusercontent.com',
);

class _BottomSheet extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // ignore: prefer_function_declarations_over_variables
    final login = (provider, token) async {
      if (!context.mounted) {
        return;
      }

      await context.loader.run(() async {
        final client = ref.read(ferryProvider.notifier);

        final req = GLoginScreen_AuthorizeSingleSignOnToken_MutationReq(
          (b) => b
            ..vars.input.provider = provider
            ..vars.input.token = token,
        );

        final resp = await client.request(req);

        if (resp.authorizeSingleSignOnToken.kind == GAuthTokenKind.ACCESS_TOKEN) {
          await ref.read(authProvider.notifier).setAccessToken(resp.authorizeSingleSignOnToken.token);
        } else if (resp.authorizeSingleSignOnToken.kind == GAuthTokenKind.PROVISIONED_USER_TOKEN) {
          if (context.mounted) {
            unawaited(
              showDialog(
                context: context,
                barrierDismissible: false,
                useRootNavigator: false,
                builder: (context) {
                  return SignupDialog(token: resp.authorizeSingleSignOnToken.token);
                },
              ),
            );
          }
        }
      });
    };

    return Padding(
      padding: const Pad(horizontal: 32, top: 16, bottom: 32),
      child: Column(
        children: [
          _Button(
            icon: const SvgImage('icons/google', width: 18, height: 18),
            text: '구글로 계속하기',
            foregroundColor: BrandColors.gray_900,
            backgroundColor: BrandColors.gray_0,
            borderColor: BrandColors.gray_150,
            onPressed: () async {
              await _googleSignIn.signOut();

              final authResult = await _googleSignIn.signIn();
              if (authResult == null) {
                return;
              }

              await login(
                GUserSingleSignOnProvider.GOOGLE,
                authResult.serverAuthCode!,
              );
            },
          ),
          const Gap(10),
          _Button(
            icon: const SvgImage('icons/naver', width: 18, height: 18, color: BrandColors.gray_0),
            text: '네이버로 계속하기',
            foregroundColor: BrandColors.gray_0,
            backgroundColor: const Color(0xFF03C75A),
            onPressed: () async {
              await FlutterNaverLogin.logOut();
              await FlutterNaverLogin.logIn();

              final token = await FlutterNaverLogin.currentAccessToken;
              if (!token.isValid()) {
                return;
              }

              await login(
                GUserSingleSignOnProvider.NAVER,
                token.accessToken,
              );
            },
          ),
          if (Platform.isIOS) ...[
            const Gap(10),
            _Button(
              icon: const SvgImage('icons/apple', width: 20, height: 20, color: BrandColors.gray_0),
              text: 'Apple로 계속하기',
              foregroundColor: BrandColors.gray_0,
              backgroundColor: BrandColors.gray_900,
              onPressed: () async {
                try {
                  final credential = await SignInWithApple.getAppleIDCredential(
                    scopes: [
                      AppleIDAuthorizationScopes.email,
                      AppleIDAuthorizationScopes.fullName,
                    ],
                  );

                  await login(
                    GUserSingleSignOnProvider.APPLE,
                    credential.authorizationCode,
                  );
                } on Exception catch (_) {}
              },
            ),
          ],
          const Gap(17),
          Pressable(
            child: const Text(
              '이메일로 계속하기',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                decoration: TextDecoration.underline,
                decorationThickness: 0.5,
                color: BrandColors.gray_500,
              ),
            ),
            onPressed: () async {
              await context.popWaitAndPush(const LoginWithEmailRoute());
            },
          ),
        ],
      ),
    );
  }
}

class _Button extends StatelessWidget {
  const _Button({
    required this.text,
    required this.foregroundColor,
    required this.backgroundColor,
    required this.onPressed,
    this.icon,
    this.borderColor,
  });

  final Widget? icon;
  final String text;
  final Color? borderColor;
  final Color foregroundColor;
  final Color backgroundColor;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return Pressable(
      onPressed: onPressed,
      child: Container(
        width: double.infinity,
        height: 53,
        decoration: BoxDecoration(
          color: backgroundColor,
          borderRadius: BorderRadius.circular(6),
          border: borderColor == null ? null : Border.all(color: borderColor!),
        ),
        child: Stack(
          children: [
            if (icon != null) Positioned(top: 0, bottom: 0, left: 24, child: icon!),
            Center(
              child: Text(
                text,
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: foregroundColor,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
