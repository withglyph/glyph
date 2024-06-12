import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:glyph/components/pressable.dart';
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
  void initState() {
    super.initState();

    _focusNode.addListener(() {
      // if (context.router.isTopMost && !_focusNode.hasFocus) {
      // _focusNode.requestFocus();
      // }
    });
  }

  @override
  void dispose() {
    _focusNode.dispose();
    _textController.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return DefaultShell(
      useSafeArea: true,
      title: '이메일로 시작',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.all(20),
            child: TextField(
              controller: _textController,
              focusNode: _focusNode,
              autofocus: true,
              autocorrect: false,
              keyboardType: TextInputType.emailAddress,
              textInputAction: TextInputAction.done,
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
              onSubmitted: (value) => _next(),
              // onTapOutside: (event) {
              //   print('onTapOutside');
              // },
            ),
          ),
          const Spacer(),
          Pressable(
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 16),
              color: BrandColors.brand_400,
              child: const Center(
                child: Text(
                  '다음',
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: BrandColors.gray_0,
                  ),
                ),
              ),
            ),
            onPressed: _next,
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

    context.router.push(LoginWithEmailNextRoute(email: value));
  }
}
