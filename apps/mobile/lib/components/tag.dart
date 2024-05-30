import 'package:flutter/cupertino.dart';
import 'package:glyph/graphql/fragments/__generated__/tag_tag.data.gql.dart';
import 'package:glyph/themes/colors.dart';

class Tag extends StatelessWidget {
  const Tag({super.key, required this.tag});

  final GTag_tag tag;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(color: BrandColors.gray_50),
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      child: Text(
        '#${tag.name}',
        style: const TextStyle(
          fontSize: 12,
          color: BrandColors.gray_500,
        ),
      ),
    );
  }
}
