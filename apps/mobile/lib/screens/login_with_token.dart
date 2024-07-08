import 'dart:async';

import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:get_it/get_it.dart';
import 'package:glyph/context/toast.dart';
import 'package:glyph/graphql/__generated__/login_with_token_screen_authorize_user_email_token_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/schema.schema.gql.dart';
import 'package:glyph/providers/auth.dart';
import 'package:glyph/providers/ferry.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/widgets/signup.dart';
import 'package:mixpanel_flutter/mixpanel_flutter.dart';

@RoutePage()
class LoginWithTokenScreen extends ConsumerStatefulWidget {
  const LoginWithTokenScreen({
    @QueryParam() this.token,
    super.key,
  });

  final String? token;

  @override
  ConsumerState<ConsumerStatefulWidget> createState() => _LoginWithTokenScreenState();
}

class _LoginWithTokenScreenState extends ConsumerState<LoginWithTokenScreen> {
  final _mixpanel = GetIt.I<Mixpanel>();

  @override
  void initState() {
    super.initState();

    final client = ref.read(ferryProvider.notifier);

    _mixpanel.track('user:login:success', properties: {'method': 'token'});

    final req = GLoginWithTokenScreen_AuthorizeUserEmailToken_MutationReq(
      (b) => b..vars.input.token = widget.token,
    );

    unawaited(() async {
      try {
        final resp = await client.request(req);

        if (resp.authorizeUserEmailToken.kind == GAuthTokenKind.ACCESS_TOKEN) {
          await ref.read(authProvider.notifier).setAccessToken(resp.authorizeUserEmailToken.token);
        } else if (resp.authorizeUserEmailToken.kind == GAuthTokenKind.PROVISIONED_USER_TOKEN) {
          if (mounted) {
            await showDialog(
              context: context,
              barrierDismissible: false,
              useRootNavigator: false,
              builder: (context) {
                return SignupDialog(token: resp.authorizeUserEmailToken.token);
              },
            );
          }
        }
      } on Exception {
        if (mounted) {
          context.toast.show('만료됐거나 잘못된 링크예요', type: ToastType.error);
          await context.router.navigate(const AuthRouter());
        }
      }
    }());
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold();
  }
}
