import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:glyph/shells/default.dart';

@RoutePage()
class OssLicensesDetailsScreen extends StatelessWidget {
  const OssLicensesDetailsScreen({
    required this.package,
    required this.paragraphs,
    super.key,
  });

  final String package;
  final List<String> paragraphs;

  @override
  Widget build(BuildContext context) {
    return DefaultShell(
      title: package,
      child: ListView.builder(
        physics: const AlwaysScrollableScrollPhysics(
          parent: BouncingScrollPhysics(),
        ),
        itemCount: paragraphs.length,
        itemBuilder: (context, index) {
          final paragraph = paragraphs[index];

          return Padding(
            padding: const Pad(horizontal: 20, vertical: 16),
            child: Text(
              paragraph,
              style: const TextStyle(
                fontSize: 14,
              ),
            ),
          );
        },
      ),
    );
  }
}
