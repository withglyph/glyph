import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:glyph/ferry/extension.dart';
import 'package:glyph/graphql/__generated__/login_with_email_screen_login_user_mutation.req.gql.dart';
import 'package:glyph/providers/ferry.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/themes/colors.dart';

@RoutePage()
class LoginWithEmailScreen extends ConsumerWidget {
  const LoginWithEmailScreen({super.key});

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
                  hintText: '이메일을 입력해주세요',
                  hintStyle: const TextStyle(color: BrandColors.gray_400),
                ),
                onSubmitted: (value) async {
                  if (value.isNotEmpty) {
                    final client = ref.read(ferryProvider);
                    final req = GLoginWithEmailScreen_LoginUser_MutationReq(
                      (b) => b..vars.input.email = value,
                    );
                    await client.req(req);

                    if (context.mounted) {
                      context.router
                          .push(LoginWithEmailNextRoute(email: value));
                    }
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
