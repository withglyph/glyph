import 'dart:async';

import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:glyph/ferry/error.dart';
import 'package:glyph/ferry/extension.dart';
import 'package:glyph/graphql/__generated__/login_with_code_screen_authorize_user_email_token_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/login_with_code_screen_issue_user_email_authorization_token_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/schema.schema.gql.dart';
import 'package:glyph/providers/auth.dart';
import 'package:glyph/providers/ferry.dart';
import 'package:glyph/shells/default.dart';
import 'package:glyph/themes/colors.dart';
import 'package:glyph/widgets/signup.dart';
import 'package:pinput/pinput.dart';

@RoutePage()
class LoginWithCodeScreen extends ConsumerStatefulWidget {
  const LoginWithCodeScreen({
    required this.email,
    super.key,
  });

  final String email;

  @override
  createState() => _LoginWithCodeScreenState();
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
      width: 50,
      height: 50,
      textStyle: TextStyle(
        fontSize: 24,
        fontWeight: FontWeight.w700,
      ),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(
            width: 1.5,
            color: BrandColors.gray_200,
          ),
        ),
      ),
    );

    return DefaultShell(
      bottomBorder: false,
      child: Padding(
        padding: const Pad(horizontal: 20, vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              '이메일로 전송된\n6자리 숫자를 입력해주세요',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w700,
              ),
            ),
            const Gap(5),
            Text(
              '인증 이메일이 ${widget.email}로 전송되었어요.',
              style: const TextStyle(fontSize: 14, color: BrandColors.gray_600),
            ),
            const Gap(48),
            Pinput(
              controller: _pinController,
              focusNode: _pinFocusNode,
              length: 6,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
              showCursor: false,
              forceErrorState: _hasError,
              defaultPinTheme: defaultPinTheme,
              separatorBuilder: (index) => const Gap(8),
              submittedPinTheme: defaultPinTheme.copyBorderWith(
                border: const Border(
                  bottom: BorderSide(width: 1.5, color: BrandColors.gray_900),
                ),
              ),
              focusedPinTheme: defaultPinTheme.copyBorderWith(
                border: const Border(
                  bottom: BorderSide(width: 1.5, color: BrandColors.gray_900),
                ),
              ),
              errorPinTheme: defaultPinTheme.copyWith(
                textStyle: defaultPinTheme.textStyle!.copyWith(
                  color: BrandColors.red_600,
                ),
                decoration: const BoxDecoration(
                  border: Border(
                    bottom: BorderSide(width: 1.5, color: BrandColors.red_600),
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
                  final req1 = GLoginWithCodeScreen_IssueUserEmailAuthorizationToken_MutationReq(
                    (b) => b
                      ..vars.input.email = widget.email
                      ..vars.input.code = value,
                  );
                  final resp1 = await client.req(req1);

                  final req2 = GLoginWithCodeScreen_AuthorizeUserEmailToken_MutationReq(
                    (b) => b..vars.input.token = resp1.issueUserEmailAuthorizationToken.token,
                  );
                  final resp2 = await client.req(req2);

                  if (resp2.authorizeUserEmailToken.kind == GAuthTokenKind.ACCESS_TOKEN) {
                    await ref.read(authProvider.notifier).setAccessToken(resp2.authorizeUserEmailToken.token);
                  } else if (resp2.authorizeUserEmailToken.kind == GAuthTokenKind.PROVISIONED_USER_TOKEN) {
                    if (context.mounted) {
                      await showDialog(
                        context: context,
                        barrierDismissible: false,
                        useRootNavigator: false,
                        builder: (context) {
                          return SignupDialog(token: resp2.authorizeUserEmailToken.token);
                        },
                      );
                    }
                  }
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
