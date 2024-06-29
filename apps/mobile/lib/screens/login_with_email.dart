import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_form_builder/flutter_form_builder.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:form_builder_validators/form_builder_validators.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/button.dart';
import 'package:glyph/components/forms/form_text_field.dart';
import 'package:glyph/context/dialog.dart';
import 'package:glyph/ferry/error.dart';
import 'package:glyph/ferry/extension.dart';
import 'package:glyph/graphql/__generated__/login_with_email_screen_login_user_mutation.req.gql.dart';
import 'package:glyph/providers/ferry.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/shells/default.dart';

@RoutePage()
class LoginWithEmailScreen extends ConsumerStatefulWidget {
  const LoginWithEmailScreen({super.key});

  @override
  createState() => _LoginWithEmailScreenState();
}

class _LoginWithEmailScreenState extends ConsumerState<LoginWithEmailScreen> {
  final _formKey = GlobalKey<FormBuilderState>();

  bool _isFormValid = false;

  @override
  Widget build(BuildContext context) {
    return DefaultShell(
      bottomBorder: false,
      useSafeArea: true,
      child: FormBuilder(
        key: _formKey,
        onChanged: _validate,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                '로그인에 사용할\n이메일을 입력해주세요',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const Gap(32),
              FormTextField(
                name: 'email',
                autofocus: true,
                keyboardType: TextInputType.emailAddress,
                textInputAction: TextInputAction.done,
                labelText: '이메일',
                hintText: 'hello@example.com',
                validators: [
                  FormBuilderValidators.required(errorText: '이메일을 입력해주세요'),
                  FormBuilderValidators.email(errorText: '올바른 이메일을 입력해주세요'),
                ],
                onSubmitted: (value) async => _submit(),
              ),
              const Spacer(),
              Button(
                '다음',
                size: ButtonSize.large,
                enabled: _isFormValid,
                onPressed: _submit,
              ),
            ],
          ),
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
    } on Exception catch (e) {
      final context = this.context;
      if (context.mounted) {
        await context.showDialog(
          title: '문제가 발생했어요',
          content: switch (e) {
            final IntentionalError e => e.message,
            _ => '잠시 뒤 다시 시도해주세요.',
          },
        );

        return;
      }
    }

    final context = this.context;
    if (context.mounted) {
      await context.router.push(
        LoginWithEmailNextRoute(email: values['email']),
      );
    }
  }
}
