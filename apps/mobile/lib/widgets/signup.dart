import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/button.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/context/toast.dart';
import 'package:glyph/ferry/extension.dart';
import 'package:glyph/graphql/__generated__/signup_dialog_create_user_mutation.req.gql.dart';
import 'package:glyph/icons/tabler.dart';
import 'package:glyph/providers/auth.dart';
import 'package:glyph/providers/ferry.dart';
import 'package:glyph/themes/colors.dart';

class SignupDialog extends ConsumerStatefulWidget {
  const SignupDialog({
    required this.token,
    super.key,
  });

  final String token;

  @override
  createState() => _SignupDialogState();
}

class _SignupDialogState extends ConsumerState<SignupDialog> {
  bool get _isCheckAll => _termsConsent && _isGte14 && _marketingConsent;
  set _isCheckAll(bool value) {
    setState(() {
      _termsConsent = value;
      _isGte14 = value;
      _marketingConsent = value;
    });
  }

  bool _termsConsent = false;
  bool _isGte14 = false;
  bool _marketingConsent = false;

  @override
  Widget build(BuildContext context) {
    return Dialog(
      insetPadding: const EdgeInsets.symmetric(horizontal: 20),
      backgroundColor: BrandColors.gray_0,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
      ),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(22, 22, 22, 18),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              '약관 동의',
              style: TextStyle(
                fontSize: 19,
                fontWeight: FontWeight.w700,
              ),
            ),
            const Gap(20),
            _Checkbox(
              label: const Text(
                '전체동의',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
              ),
              value: _isCheckAll,
              onChanged: (value) {
                _isCheckAll = value;
              },
            ),
            const Gap(12),
            _Checkbox(
              label: const Text(
                '(필수) 만 14세 이상입니다',
                style: TextStyle(fontSize: 15),
              ),
              value: _isGte14,
              onChanged: (value) {
                setState(() {
                  _isGte14 = value;
                });
              },
            ),
            const Gap(12),
            _Checkbox(
              label: const Text(
                '(필수) 이용약관 및 개인정보처리방침 동의',
                style: TextStyle(fontSize: 15),
              ),
              value: _termsConsent,
              onChanged: (value) {
                setState(() {
                  _termsConsent = value;
                });
              },
            ),
            const Gap(12),
            _Checkbox(
              label: const Text(
                '(선택) 광고성 알림 수신 동의',
                style: TextStyle(fontSize: 15),
              ),
              value: _marketingConsent,
              onChanged: (value) {
                setState(() {
                  _marketingConsent = value;
                });
              },
            ),
            const Gap(34),
            Row(
              children: [
                Expanded(
                  child: Button(
                    '취소',
                    kind: ButtonKind.secondary,
                    onPressed: () {
                      context.router.popUntilRoot();
                    },
                  ),
                ),
                const Gap(8),
                Expanded(
                  child: Button(
                    '가입하기',
                    onPressed: () async {
                      if (!_termsConsent || !_isGte14) {
                        context.toast.show('필수 항목에 모두 동의해주세요', type: ToastType.error);
                        return;
                      }

                      final client = ref.read(ferryProvider);
                      final req = GSignupDialog_CreateUser_MutationReq(
                        (b) => b
                          ..vars.input.token = widget.token
                          ..vars.input.termsConsent = _termsConsent
                          ..vars.input.isGte14 = _isGte14
                          ..vars.input.marketingConsent = _marketingConsent,
                      );
                      final resp = await client.req(req);

                      await ref.read(authProvider.notifier).setAccessToken(resp.createUser.token);
                    },
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _Checkbox extends StatelessWidget {
  const _Checkbox({
    required this.label,
    required this.value,
    required this.onChanged,
  });

  final Widget label;
  final bool value;
  // ignore: avoid_positional_boolean_parameters
  final Function(bool value) onChanged;

  @override
  Widget build(BuildContext context) {
    return Pressable(
      child: Row(
        children: [
          Icon(
            Tabler.circle_check_filled,
            color: value ? BrandColors.gray_900 : BrandColors.gray_200,
          ),
          const Gap(8),
          label,
        ],
      ),
      onPressed: () {
        onChanged(!value);
      },
    );
  }
}
