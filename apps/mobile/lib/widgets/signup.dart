import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:get_it/get_it.dart';
import 'package:glyph/components/btn.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/context/toast.dart';
import 'package:glyph/graphql/__generated__/signup_dialog_create_user_mutation.req.gql.dart';
import 'package:glyph/icons/tabler.dart';
import 'package:glyph/providers/auth.dart';
import 'package:glyph/providers/ferry.dart';
import 'package:glyph/themes/colors.dart';
import 'package:mixpanel_flutter/mixpanel_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

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
  final _mixpanel = GetIt.I<Mixpanel>();

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
      insetPadding: const Pad(horizontal: 20),
      backgroundColor: Colors.transparent,
      elevation: 0,
      shape: LinearBorder.none,
      child: Container(
        padding: const Pad(horizontal: 22, top: 22, bottom: 18),
        decoration: BoxDecoration(
          color: BrandColors.gray_0,
          borderRadius: BorderRadius.circular(8),
          boxShadow: [
            BoxShadow(
              color: BrandColors.gray_900.withOpacity(0.35),
              offset: const Offset(2, 4),
              blurRadius: 20,
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              '글리프 시작하기',
              style: TextStyle(
                fontSize: 19,
                fontWeight: FontWeight.w800,
              ),
            ),
            const Gap(20),
            _Checkbox(
              label: const Text(
                '전체 동의',
                style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
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
              label: DefaultTextStyle.merge(
                style: const TextStyle(fontSize: 15),
                child: Builder(
                  builder: (context) {
                    return Text.rich(
                      TextSpan(
                        style: DefaultTextStyle.of(context).style,
                        children: [
                          const TextSpan(text: '(필수) '),
                          WidgetSpan(
                            alignment: PlaceholderAlignment.middle,
                            child: Pressable(
                              child: const Text('이용약관', style: TextStyle(decoration: TextDecoration.underline)),
                              onPressed: () async {
                                await launchUrl(
                                  Uri.parse('https://help.withglyph.com/legal/terms'),
                                  mode: LaunchMode.inAppBrowserView,
                                );
                              },
                            ),
                          ),
                          const TextSpan(text: ' 및 '),
                          WidgetSpan(
                            alignment: PlaceholderAlignment.middle,
                            child: Pressable(
                              child: const Text('개인정보처리방침', style: TextStyle(decoration: TextDecoration.underline)),
                              onPressed: () async {
                                await launchUrl(
                                  Uri.parse('https://help.withglyph.com/legal/privacy'),
                                  mode: LaunchMode.inAppBrowserView,
                                );
                              },
                            ),
                          ),
                          const TextSpan(text: ' 동의'),
                        ],
                      ),
                    );
                  },
                ),
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
                  child: Btn(
                    '취소',
                    theme: BtnTheme.secondary,
                    onPressed: () {
                      context.router.popUntilRoot();
                    },
                  ),
                ),
                const Gap(8),
                Expanded(
                  child: Btn(
                    '가입하기',
                    onPressed: () async {
                      if (!_termsConsent || !_isGte14) {
                        context.toast.show('필수 항목에 모두 동의해주세요', type: ToastType.error);
                        return;
                      }

                      final client = ref.read(ferryProvider.notifier);

                      _mixpanel.track('user:signup:success');

                      final req = GSignupDialog_CreateUser_MutationReq(
                        (b) => b
                          ..vars.input.token = widget.token
                          ..vars.input.termsConsent = _termsConsent
                          ..vars.input.isGte14 = _isGte14
                          ..vars.input.marketingConsent = _marketingConsent,
                      );
                      final resp = await client.request(req);

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
