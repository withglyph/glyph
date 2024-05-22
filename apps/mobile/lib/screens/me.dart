import 'package:auto_route/auto_route.dart';
import 'package:ferry_flutter/ferry_flutter.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/button.dart';
import 'package:glyph/context/loader.dart';
import 'package:glyph/extensions/color.dart';
import 'package:glyph/graphql/__generated__/me_screen_query.req.gql.dart';
import 'package:glyph/providers/auth.dart';
import 'package:glyph/providers/ferry.dart';
import 'package:glyph/providers/push_notification.dart';
import 'package:glyph/themes/colors.dart';

@RoutePage()
class MeScreen extends ConsumerWidget {
  const MeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ferry = ref.watch(ferryProvider);

    return Operation(
      client: ferry,
      operationRequest: GMeScreen_QueryReq(),
      builder: (context, response, error) {
        if (response == null || response.loading) {
          return const Center(child: CircularProgressIndicator());
        }

        final me = response.data?.me;
        if (me == null) {
          throw Exception();
        }

        return Column(
          children: [
            Stack(
              alignment: Alignment.bottomCenter,
              clipBehavior: Clip.none,
              children: [
                SizedBox(
                  width: double.infinity,
                  height: 150,
                  child: DecoratedBox(
                    decoration: BoxDecoration(
                      color: HexColor.fromHex(me.profile.avatar.color),
                    ),
                  ),
                ),
                Positioned(
                  bottom: -64,
                  child: CircleAvatar(
                    radius: 64,
                    backgroundColor: BrandColors.gray_0,
                    child: Padding(
                      padding: const EdgeInsets.all(4),
                      child:
                          ClipOval(child: Image.network(me.profile.avatar.url)),
                    ),
                  ),
                ),
              ],
            ),
            const Gap(64),
            Text(
              me.profile.name,
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800),
            ),
            const Spacer(),
            Button(
              child: const Text('로그아웃'),
              onPressed: () async {
                context.loader.run(() async {
                  await ref
                      .read(pushNotificationProvider.notifier)
                      .clearToken();
                  await ref.read(authProvider.notifier).clearAccessToken();
                });
              },
            ),
            const Gap(16),
          ],
        );
      },
    );
  }
}
