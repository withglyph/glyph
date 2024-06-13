import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_form_builder/flutter_form_builder.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:form_builder_validators/form_builder_validators.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/components/forms/form_text_field.dart';
import 'package:glyph/context/dialog.dart';
import 'package:glyph/ferry/error.dart';
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

  final _formKey = GlobalKey<FormBuilderState>();

  bool _isFormValid = false;

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
      child: FormBuilder(
        key: _formKey,
        onChanged: _validate,
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
                  FormTextField(
                    name: 'email',
                    controller: _textController,
                    focusNode: _focusNode,
                    autofocus: true,
                    keyboardType: TextInputType.emailAddress,
                    textInputAction: TextInputAction.done,
                    labelText: '이메일',
                    hintText: 'hello@example.com',
                    validators: [
                      FormBuilderValidators.required(),
                      FormBuilderValidators.email()
                    ],
                    onSubmitted: (value) => _submit(),
                  ),
                ],
              ),
            ),
            const Spacer(),
            Pressable(
              onPressed: _submit,
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    color: _isFormValid
                        ? BrandColors.brand_400
                        : BrandColors.gray_100,
                    child: Center(
                      child: Text(
                        '다음',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: _isFormValid
                              ? BrandColors.gray_0
                              : BrandColors.gray_300,
                        ),
                      ),
                    ),
                  ),
                  Container(
                    height: MediaQuery.of(context).padding.bottom,
                    color: _isFormValid
                        ? BrandColors.brand_400
                        : BrandColors.gray_100,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _validate() {
    final isFormValid = _formKey.currentState!.validate();

    if (isFormValid != _isFormValid) {
      setState(() {
        _isFormValid = isFormValid;
      });
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.saveAndValidate()) {
      return;
    }

    final values = _formKey.currentState!.value;
    final client = ref.read(ferryProvider);

    try {
      await client.req(
        GLoginWithEmailScreen_LoginUser_MutationReq(
          (b) => b..vars.input.email = values['email'],
        ),
      );
    } catch (e) {
      final context = this.context;
      if (context.mounted) {
        context.showDialog(
          title: '문제가 발생했어요',
          content: switch (e) {
            IntentionalError _ => e.message,
            _ => '잠시 뒤 다시 시도해주세요.',
          },
        );

        return;
      }
    }

    final context = this.context;
    if (context.mounted) {
      context.router.push(LoginWithEmailNextRoute(email: values['email']));
    }
  }
}
