import 'dart:async';

import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:glyph/context/toast.dart';
import 'package:glyph/graphql/__generated__/post_shortlink_screen_query.req.gql.dart';
import 'package:glyph/providers/ferry.dart';
import 'package:glyph/routers/app.gr.dart';

@RoutePage()
class PostShortlinkScreen extends ConsumerStatefulWidget {
  const PostShortlinkScreen({
    @PathParam() required this.shortlink,
    super.key,
  });

  final String shortlink;

  @override
  ConsumerState<ConsumerStatefulWidget> createState() => _PostShortlinkScreenState();
}

class _PostShortlinkScreenState extends ConsumerState<PostShortlinkScreen> {
  @override
  void initState() {
    super.initState();

    final client = ref.read(ferryProvider.notifier);

    final req = GPostShortlinkScreen_QueryReq(
      (b) => b..vars.shortlink = widget.shortlink,
    );

    unawaited(() async {
      try {
        final resp = await client.request(req);
        if (mounted) {
          await context.router.replace(PostRoute(permalink: resp.postShortlink.permalink));
        }
      } on Exception {
        if (mounted) {
          context.toast.show('잘못된 링크예요', type: ToastType.error);
          await context.router.maybePop();
        }
      }
    }());
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold();
  }
}
