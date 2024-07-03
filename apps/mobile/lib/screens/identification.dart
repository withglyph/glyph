import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/btn.dart';
import 'package:glyph/context/dialog.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/identification_screen_query.req.gql.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/shells/default.dart';

@RoutePage()
class IdentificationScreen extends StatelessWidget {
  const IdentificationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultShell(
      bottomBorder: false,
      useSafeArea: true,
      title: '본인인증',
      child: GraphQLOperation(
        operation: GIdentificationScreen_QueryReq(),
        builder: (context, client, data) {
          return Padding(
            padding: const Pad(horizontal: 20, vertical: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('본인인증 여부: ${data.me!.personalIdentity != null}'),
                if (data.me!.personalIdentity != null) Text('본인인증 이름: ${data.me!.personalIdentity!.name}'),
                const Gap(32),
                Btn(
                  '본인인증',
                  onPressed: () async {
                    final result = await context.router.push(const IdentificationIamportRoute());
                    if (context.mounted) {
                      await context.showDialog(title: '결과', content: result.toString());
                    }
                  },
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
