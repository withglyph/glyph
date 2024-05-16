import 'package:ferry/ferry.dart';
import 'package:ferry_flutter/ferry_flutter.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:get_it/get_it.dart';
import 'package:glyph/components/button.dart';
import 'package:glyph/graphql/__generated__/home_screen_query.req.gql.dart';
import 'package:glyph/signals.dart';
import 'package:go_router/go_router.dart';

class HomeScreen extends StatelessWidget {
  HomeScreen({super.key});

  final client = GetIt.I<Client>();

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      child: Operation(
        client: client,
        operationRequest: GHomeScreen_QueryReq(),
        builder: (context, response, error) {
          if (response == null || response.loading) {
            return const Center(child: CircularProgressIndicator());
          }

          final me = response.data?.me;

          if (me == null) {
            return const Center(child: Text('No user'));
          }

          return Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircleAvatar(
                radius: 64,
                backgroundImage: NetworkImage(me.profile.avatar.url),
              ),
              const Gap(8),
              Text(
                me.profile.name,
                style: const TextStyle(fontSize: 24),
              ),
              const Gap(24),
              Button(
                child: const Text('로그아웃'),
                onPressed: () {
                  accessToken.value = null;
                  GetIt.I.resetLazySingleton<Client>();

                  context.go('/login');
                },
              )
            ],
          );
        },
      ),
    );
  }
}
