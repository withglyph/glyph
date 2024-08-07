import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:flutter/cupertino.dart';
import 'package:glyph/graphql/fragments/__generated__/tag_tag.data.gql.dart';
import 'package:glyph/themes/colors.dart';

class Tag extends StatelessWidget {
  Tag(GTag_tag tag, {super.key}) : name = '#${tag.name}';
  const Tag.text(this.name, {super.key});

  final String name;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const Pad(horizontal: 6, vertical: 2),
      decoration: const BoxDecoration(
        color: Color(0xFFF7F7F7),
        borderRadius: BorderRadius.all(Radius.circular(2)),
      ),
      child: Text(
        name,
        overflow: TextOverflow.ellipsis,
        style: const TextStyle(
          fontSize: 11,
          color: BrandColors.gray_500,
        ),
      ),
    );
  }
}
