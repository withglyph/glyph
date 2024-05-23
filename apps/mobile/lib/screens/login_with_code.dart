import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:glyph/ferry/extension.dart';
import 'package:glyph/graphql/__generated__/login_with_code_screen_authorize_user_email_token_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/login_with_code_screen_issue_user_email_authorization_token_mutation.req.gql.dart';
import 'package:glyph/providers/auth.dart';
import 'package:glyph/providers/ferry.dart';
import 'package:glyph/themes/colors.dart';

@RoutePage()
class LoginWithCodeScreen extends ConsumerWidget {
  const LoginWithCodeScreen({super.key, required this.email});

  final String email;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: SafeArea(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              TextField(
                decoration: InputDecoration(
                  isDense: true,
                  filled: true,
                  fillColor: BrandColors.gray_0,
                  enabledBorder: OutlineInputBorder(
                    borderSide:
                        const BorderSide(color: BrandColors.gray_200, width: 1),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderSide:
                        const BorderSide(color: BrandColors.gray_600, width: 1),
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
                        GLoginWithCodeScreen_IssueUserEmailAuthorizationToken_MutationReq(
                      (b) => b
                        ..vars.input.email = email
                        ..vars.input.code = value,
                    );
                    final resp1 = await client.req(req1);

                    final req2 =
                        GLoginWithCodeScreen_AuthorizeUserEmailToken_MutationReq(
                      (b) => b
                        ..vars.input.email = email
                        ..vars.input.token =
                            resp1.issueUserEmailAuthorizationToken.token,
                    );

                    final resp2 = await client.req(req2);
                    print('hello $resp2');
                    await ref
                        .read(authProvider.notifier)
                        .setAccessToken(resp2.authorizeUserEmailToken.token);
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
