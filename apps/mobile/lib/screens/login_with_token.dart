import 'dart:async';

import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:glyph/ferry/extension.dart';
import 'package:glyph/graphql/__generated__/login_with_token_screen_authorize_user_email_token_mutation.req.gql.dart';
import 'package:glyph/providers/auth.dart';
import 'package:glyph/providers/ferry.dart';

@RoutePage()
class LoginWithTokenScreen extends ConsumerStatefulWidget {
  const LoginWithTokenScreen({super.key, @QueryParam() this.token = ''});

  final String token;

  @override
  ConsumerState<ConsumerStatefulWidget> createState() =>
      _LoginWithTokenScreenState();
}

class _LoginWithTokenScreenState extends ConsumerState<LoginWithTokenScreen> {
  @override
  void initState() {
    super.initState();

    final client = ref.read(ferryProvider);
    final req = GLoginWithTokenScreen_AuthorizeUserEmailToken_MutationReq(
      (b) => b..vars.input.token = widget.token,
    );

    unawaited(
      client.req(req).then((resp) async {
        await ref
            .read(authProvider.notifier)
            .setAccessToken(resp.authorizeUserEmailToken.token);
      }),
    );
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Padding(
        padding: EdgeInsets.symmetric(horizontal: 20),
        child: SafeArea(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              CircularProgressIndicator(),
              Text('로그인 중이에요', style: TextStyle(fontSize: 14)),
            ],
          ),
        ),
      ),
    );
  }
}
