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
import 'package:glyph/shells/default.dart';
import 'package:glyph/themes/colors.dart';
import 'package:pinput/pinput.dart';

@RoutePage()
class LoginWithCodeScreen extends ConsumerStatefulWidget {
  const LoginWithCodeScreen({
    required this.email,
    super.key,
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

  bool _hasError = false;

  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await ModalRoute.of(context)!.didPush().then((value) {
        _pinFocusNode.requestFocus();
        _transitionCompleter.complete();
      });
    });
  }

  @override
  void dispose() {
    _pinFocusNode.dispose();
    _pinController.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    const defaultPinTheme = PinTheme(
      width: 56,
      height: 56,
      textStyle: TextStyle(
        fontSize: 24,
        fontWeight: FontWeight.w700,
      ),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(
            color: BrandColors.gray_200,
          ),
        ),
      ),
    );

    return DefaultShell(
      bottomBorder: false,
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              '코드 입력',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w700,
              ),
            ),
            const Gap(24),
            Text(
              '인증 메일이 ${widget.email}으로 전송되었어요.',
              style: const TextStyle(fontSize: 16),
            ),
            const Text(
              '받으신 이메일에 있는 코드 6자리를 입력해주세요.',
              style: TextStyle(fontSize: 16),
            ),
            const Gap(32),
            Pinput(
              controller: _pinController,
              focusNode: _pinFocusNode,
              length: 6,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
              showCursor: false,
              forceErrorState: _hasError,
              defaultPinTheme: defaultPinTheme,
              submittedPinTheme: defaultPinTheme.copyBorderWith(
                border: const Border(
                  bottom: BorderSide(color: BrandColors.gray_400),
                ),
              ),
              focusedPinTheme: defaultPinTheme.copyBorderWith(
                border: const Border(
                  bottom: BorderSide(color: BrandColors.brand_400),
                ),
              ),
              errorPinTheme: defaultPinTheme.copyWith(
                textStyle: defaultPinTheme.textStyle!.copyWith(
                  color: Colors.red,
                ),
                decoration: const BoxDecoration(
                  border: Border(
                    bottom: BorderSide(color: Colors.red),
                  ),
                ),
              ),
              pinAnimationType: PinAnimationType.fade,
              animationDuration: const Duration(milliseconds: 100),
              onClipboardFound: (value) {
                _pinController.text = value;
              },
              onChanged: (value) {
                setState(() {
                  _hasError = false;
                });
              },
              onCompleted: (value) async {
                await _transitionCompleter.future;
                _pinFocusNode.requestFocus();

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
                } on IntentionalError catch (_) {
                  setState(() {
                    _hasError = true;
                  });

                  Future.delayed(
                    const Duration(milliseconds: 500),
                    _pinController.clear,
                  );
                }
              },
            ),
          ],
        ),
      ),
    );
  }
}
