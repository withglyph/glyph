import 'dart:async';
import 'dart:io';

import 'package:auto_route/auto_route.dart';
import 'package:ferry_flutter/ferry_flutter.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_naver_login/flutter_naver_login.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/heading.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/components/svg_icon.dart';
import 'package:glyph/context/bottom_sheet.dart';
import 'package:glyph/context/loader.dart';
import 'package:glyph/ferry/extension.dart';
import 'package:glyph/graphql/__generated__/login_screen_authorize_single_sign_on_token_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/login_screen_query.req.gql.dart';
import 'package:glyph/graphql/__generated__/schema.schema.gql.dart';
import 'package:glyph/providers/auth.dart';
import 'package:glyph/providers/ferry.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/themes/colors.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';
import 'package:transparent_image/transparent_image.dart';

@RoutePage()
class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _animationController;
  late final Animation<Alignment> _alignmentAnimation;

  @override
  void initState() {
    super.initState();

    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(minutes: 20),
    );

    _animationController
      ..addListener(() {
        if (_animationController.status == AnimationStatus.completed) {
          final client = ref.read(ferryProvider);
          client.requestController.add(GLoginScreen_QueryReq());
        }
      })
      ..repeat();

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
    final client = ref.watch(ferryProvider);

    return Operation(
      client: client,
      operationRequest: GLoginScreen_QueryReq(),
      builder: (context, response, error) {
        return Scaffold(
          appBar: const Heading(
            backgroundColor: null,
            fallbackSystemUiOverlayStyle: SystemUiOverlayStyle.dark,
            bottomBorder: false,
          ),
          backgroundColor: BrandColors.gray_900,
          resizeToAvoidBottomInset: false,
          extendBodyBehindAppBar: true,
          body: Stack(
            children: [
              if (response?.data != null)
                Positioned.fill(
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
                      children: response!.data!.featuredImages
                          .map(
                            (image) => FadeInImage(
                              placeholder: MemoryImage(kTransparentImage),
                              image: NetworkImage(image.url),
                              height: double.infinity,
                              fit: BoxFit.cover,
                              fadeInDuration:
                                  const Duration(milliseconds: 1000),
                              color: Colors.black.withOpacity(0.5),
                              colorBlendMode: BlendMode.srcATop,
                            ),
                          )
                          .toList(),
                    ),
                  ),
                ),
              Positioned.fill(
                child: Padding(
                  padding: EdgeInsets.fromLTRB(
                    32,
                    MediaQuery.of(context).padding.top + 36,
                    32,
                    44,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        '당신의\n애정을 담은\n창작을 응원합니다',
                        style: TextStyle(
                          fontSize: 30,
                          fontWeight: FontWeight.w700,
                          color: BrandColors.gray_0,
                        ),
                      ),
                      const Gap(16),
                      const Text(
                        '창작자를 위한 플랫폼 글리프와 함께 하세요',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                          color: BrandColors.gray_0,
                        ),
                      ),
                      const Spacer(),
                      Pressable(
                        child: Container(
                          width: double.infinity,
                          height: 56,
                          decoration: BoxDecoration(
                            color: BrandColors.brand_400,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          alignment: Alignment.center,
                          child: const Text(
                            '시작하기',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: BrandColors.gray_0,
                            ),
                          ),
                        ),
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
      },
    );
  }
}

GoogleSignIn _googleSignIn = GoogleSignIn(
  clientId:
      '58678861052-lf5sv4oggv0ieiuitk9vnh6c6nmq2e4m.apps.googleusercontent.com',
  serverClientId:
      '58678861052-afsh5183jqgh7n1cv0gp5drctvdkfb1t.apps.googleusercontent.com',
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
        final client = ref.read(ferryProvider);

        final req = GLoginScreen_AuthorizeSingleSignOnToken_MutationReq(
          (b) => b
            ..vars.input.provider = provider
            ..vars.input.token = token,
        );

        final resp = await client.req(req);

        await ref
            .read(authProvider.notifier)
            .setAccessToken(resp.authorizeSingleSignOnToken.token);
      });
    };

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text(
            '반가워요!',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w800,
            ),
          ),
          const Gap(12),
          const Text(
            '창작자를 위한 콘텐츠 플랫폼\n글리프에 오신 것을 환영해요',
            style: TextStyle(
              fontSize: 16,
              color: BrandColors.gray_400,
              fontWeight: FontWeight.w700,
            ),
          ),
          const Gap(24),
          _Button(
            icon: const SvgIcon('naver', size: 16, color: BrandColors.gray_0),
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
          const Gap(8),
          _Button(
            icon: const SvgIcon('google', size: 16, color: null),
            text: '구글로 계속하기',
            foregroundColor: BrandColors.gray_900,
            backgroundColor: BrandColors.gray_0,
            borderColor: BrandColors.gray_200,
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
          if (Platform.isIOS) ...[
            const Gap(8),
            _Button(
              icon: const SvgIcon('apple', size: 16, color: BrandColors.gray_0),
              text: '애플로 계속하기',
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
          const Gap(16),
          _Button(
            text: '이메일로 계속하기',
            foregroundColor: BrandColors.gray_500,
            backgroundColor: BrandColors.gray_0,
            onPressed: () async {
              final router = context.router;
              unawaited(router.maybePop());
              await ModalRoute.of(context)!.completed;
              await router.push(const LoginWithEmailRoute());
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
        height: 48,
        decoration: BoxDecoration(
          color: backgroundColor,
          borderRadius: BorderRadius.circular(4),
          border: borderColor == null ? null : Border.all(color: borderColor!),
        ),
        child: Stack(
          children: [
            if (icon != null)
              Positioned(
                top: 0,
                bottom: 0,
                left: 16,
                child: icon!,
              ),
            Center(
              child: Text(
                text,
                style: TextStyle(
                  fontSize: 16,
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
