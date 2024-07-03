import 'dart:async';

import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_form_builder/flutter_form_builder.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:form_builder_validators/form_builder_validators.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/btn.dart';
import 'package:glyph/components/forms/form_text_field.dart';
import 'package:glyph/context/toast.dart';
import 'package:glyph/ferry/extension.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/email_screen_query.req.gql.dart';
import 'package:glyph/graphql/__generated__/email_screen_update_user_email_mutation.req.gql.dart';
import 'package:glyph/providers/ferry.dart';
import 'package:glyph/shells/default.dart';
import 'package:glyph/themes/colors.dart';

@RoutePage()
class EmailScreen extends ConsumerStatefulWidget {
  const EmailScreen({super.key});

  @override
  createState() => _EmailScreenState();
}

class _EmailScreenState extends ConsumerState<EmailScreen> {
  final _formKey = GlobalKey<FormBuilderState>();

  bool _isFormValid = false;

  @override
  Widget build(BuildContext context) {
    return DefaultShell(
      bottomBorder: false,
      useSafeArea: true,
      title: '이메일 변경',
      child: FormBuilder(
        key: _formKey,
        onChanged: () {
          setState(() {
            _isFormValid = _formKey.currentState!.validate();
          });
        },
        child: GraphQLOperation(
          operation: GEmailScreen_QueryReq(),
          builder: (context, client, data) {
            return Padding(
              padding: const Pad(all: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    '현재 이메일 주소',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: BrandColors.gray_500,
                    ),
                  ),
                  const Gap(13),
                  Text(
                    data.me!.email,
                    style: const TextStyle(
                      fontSize: 14,
                      color: BrandColors.gray_800,
                    ),
                  ),
                  const Gap(34),
                  FormTextField(
                    name: 'email',
                    autofocus: true,
                    labelText: '변경할 이메일 주소',
                    hintText: '이메일 주소를 입력해주세요',
                    validators: [
                      FormBuilderValidators.required(errorText: '이메일 주소를 입력해주세요'),
                      FormBuilderValidators.email(errorText: '올바른 이메일을 입력해주세요'),
                    ],
                    onSubmitted: (value) async => _submit(),
                  ),
                  const Spacer(),
                  Btn(
                    '변경',
                    size: BtnSize.large,
                    enabled: _isFormValid,
                    onPressed: _submit,
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.saveAndValidate()) {
      return;
    }

    final values = _formKey.currentState!.value;
    final client = ref.read(ferryProvider);

    final req = GEmailScreen_UpdateUserEmail_MutationReq(
      (b) => b..vars.input.email = values['email'],
    );
    await client.req(req);

    if (mounted) {
      unawaited(context.router.maybePop());
      context.toast.show('변경된 이메일로 인증 메일을 보냈어요');
    }
  }
}
