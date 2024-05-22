import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/button.dart';
import 'package:glyph/context/loader.dart';
import 'package:glyph/extensions/color.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/me_screen_query.req.gql.dart';
import 'package:glyph/providers/auth.dart';
import 'package:glyph/providers/push_notification.dart';
import 'package:glyph/themes/colors.dart';

@RoutePage()
class MeScreen extends ConsumerWidget {
  const MeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return GraphQLOperation(
      operation: GMeScreen_QueryReq(),
      builder: (context, client, data) {
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
                      color: HexColor.fromHex(data.me!.profile.avatar.color),
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
                      child: ClipOval(
                        child: Image.network(
                          data.me!.profile.avatar.url,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const Gap(64),
            Text(
              data.me!.profile.name,
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
