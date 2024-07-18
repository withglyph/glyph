import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:get_it/get_it.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/components/toggle_switch.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/shells/default.dart';
import 'package:glyph/themes/colors.dart';
import 'package:mixpanel_flutter/mixpanel_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';

@RoutePage()
class DeveloperScreen extends ConsumerStatefulWidget {
  const DeveloperScreen({super.key});

  @override
  createState() => _DeveloperScreenState();
}

class _DeveloperScreenState extends ConsumerState<DeveloperScreen> {
  final _mixpanel = GetIt.I<Mixpanel>();
  final _prefs = GetIt.I<SharedPreferences>();

  @override
  Widget build(BuildContext context) {
    return DefaultShell(
      title: '개발자 설정',
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(
          parent: BouncingScrollPhysics(),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const Pad(horizontal: 20, top: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const _Section('화면'),
                  Pressable(
                    child: const Padding(
                      padding: Pad(top: 16, bottom: 18),
                      child: Row(
                        children: [
                          Text(
                            '큐레이션',
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          Spacer(),
                        ],
                      ),
                    ),
                    onPressed: () async => {await context.router.push(const OnboardingCurationRoute())},
                  ),
                  const _Section('렌더링'),
                  Padding(
                    padding: const Pad(top: 16, bottom: 18),
                    child: Row(
                      children: [
                        const Text(
                          '포스트 네이티브 렌더러 사용',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const Spacer(),
                        ToggleSwitch(
                          value: _prefs.getBool('useNativePostRendering') ?? false,
                          onChanged: (value) async {
                            await _prefs.setBool('useNativePostRendering', value);
                            _mixpanel.track('developer:use-native-post-routing', properties: {'enabled': value});

                            setState(() {});
                          },
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const Gap(80),
          ],
        ),
      ),
    );
  }
}

class _Section extends StatelessWidget {
  const _Section(this.title);

  final String title;

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 12,
        fontWeight: FontWeight.w600,
        color: BrandColors.gray_400,
      ),
    );
  }
}
