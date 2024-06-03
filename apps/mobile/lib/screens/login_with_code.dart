import 'dart:async';

import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:glyph/ferry/error.dart';
import 'package:glyph/ferry/extension.dart';
import 'package:glyph/graphql/__generated__/login_with_email_next_screen_authorize_user_email_token_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/login_with_email_next_screen_issue_user_email_authorization_token_mutation.req.gql.dart';
import 'package:glyph/providers/auth.dart';
import 'package:glyph/providers/ferry.dart';
import 'package:glyph/themes/colors.dart';
import 'package:pinput/pinput.dart';

@RoutePage()
class LoginWithCodeScreen extends ConsumerStatefulWidget {
  const LoginWithCodeScreen({
    super.key,
    required this.email,
  });

  final String email;

  @override
  ConsumerState<ConsumerStatefulWidget> createState() =>
      _LoginWithCodeScreenState();
}

class _LoginWithCodeScreenState extends ConsumerState<LoginWithCodeScreen> {
  final _pinFocusNode = FocusNode();
  final _pinController = TextEditingController();
  final _transitionCompleter = Completer();

  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final transitionAnimation = ModalRoute.of(context)?.animation;
      if (transitionAnimation == null) {
        _transitionCompleter.complete();
      } else {
        transitionAnimation.addStatusListener((status) {
          if (status == AnimationStatus.completed) {
            _transitionCompleter.complete();
          }
        });
      }
    });
  }

  @override
  void dispose() {
    _pinController.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final defaultPinTheme = PinTheme(
      width: 56,
      height: 56,
      decoration: BoxDecoration(
        border: Border.all(color: BrandColors.gray_200),
        borderRadius: BorderRadius.circular(4),
      ),
    );

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
              const Text('받으신 이메일을 열어 코드 6자리를 입력해주세요',
                  style: TextStyle(fontSize: 14)),
              const Gap(32),
              Pinput(
                controller: _pinController,
                focusNode: _pinFocusNode,
                autofocus: true,
                length: 6,
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                showCursor: false,
                defaultPinTheme: defaultPinTheme,
                focusedPinTheme: defaultPinTheme.copyBorderWith(
                  border: Border.all(color: BrandColors.gray_600),
                ),
                pinAnimationType: PinAnimationType.fade,
                animationDuration: const Duration(milliseconds: 100),
                onClipboardFound: (value) {
                  _pinController.text = value;
                },
                onCompleted: (value) async {
                  await _transitionCompleter.future;

                  final client = ref.read(ferryProvider);

                  try {
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
                        ..vars.input.token =
                            resp1.issueUserEmailAuthorizationToken.token,
                    );
                    final resp2 = await client.req(req2);

                    await ref
                        .read(authProvider.notifier)
                        .setAccessToken(resp2.authorizeUserEmailToken.token);
                  } on OperationError catch (_) {
                    _pinController.clear();
                    _pinFocusNode.requestFocus();
                  }
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
