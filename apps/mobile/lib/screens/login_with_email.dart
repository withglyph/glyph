import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/components/text_input_field.dart';
import 'package:glyph/ferry/extension.dart';
import 'package:glyph/graphql/__generated__/login_with_email_screen_login_user_mutation.req.gql.dart';
import 'package:glyph/providers/ferry.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/shells/default.dart';
import 'package:glyph/themes/colors.dart';

@RoutePage()
class LoginWithEmailScreen extends ConsumerStatefulWidget {
  const LoginWithEmailScreen({super.key});

  @override
  createState() => _LoginWithEmailScreenState();
}

class _LoginWithEmailScreenState extends ConsumerState<LoginWithEmailScreen> {
  final _focusNode = FocusNode();
  final _textController = TextEditingController();

  @override
  void dispose() {
    _focusNode.dispose();
    _textController.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return DefaultShell(
      bottomBorder: false,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  '이메일로 시작하기',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const Gap(24),
                TextInputField(
                  controller: _textController,
                  focusNode: _focusNode,
                  autofocus: true,
                  keyboardType: TextInputType.emailAddress,
                  textInputAction: TextInputAction.done,
                  labelText: '이메일',
                  hintText: 'hello@example.com',
                  onSubmitted: (value) => _next(),
                ),
              ],
            ),
          ),
          const Spacer(),
          Pressable(
            onPressed: _next,
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  color: BrandColors.brand_400,
                  child: const Center(
                    child: Text(
                      '다음',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: BrandColors.gray_0,
                      ),
                    ),
                  ),
                ),
                Container(
                  height: MediaQuery.of(context).padding.bottom,
                  color: BrandColors.brand_400,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _next() async {
    _focusNode.requestFocus();

    final value = _textController.text.trim();
    if (value.isEmpty) {
      return;
    }

    final client = ref.read(ferryProvider);
    final req = GLoginWithEmailScreen_LoginUser_MutationReq(
      (b) => b..vars.input.email = value,
    );
    await client.req(req);

    final context = this.context;
    if (context.mounted) {
      context.router.push(LoginWithEmailNextRoute(email: value));
    }
  }
}
