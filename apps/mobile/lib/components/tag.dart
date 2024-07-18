import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:flutter/cupertino.dart';
import 'package:glyph/graphql/fragments/__generated__/tag_tag.data.gql.dart';
import 'package:glyph/themes/colors.dart';

class Tag extends StatelessWidget {
  Tag(GTag_tag tag, {super.key, bool highlightFollowed = false})
      : name = '#${tag.name}',
        highlight = highlightFollowed && tag.followed;
  const Tag.text(this.name, {required this.highlight, super.key});

  final String name;
  final bool highlight;
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const Pad(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: highlight ? BrandColors.gray_150 : const Color(0xFFF7F7F7),
        borderRadius: const BorderRadius.all(Radius.circular(2)),
      ),
      child: Text(
        name,
        overflow: TextOverflow.ellipsis,
        style: TextStyle(
          fontSize: 11,
          color: highlight ? BrandColors.gray_800 : BrandColors.gray_500,
        ),
      ),
    );
  }
}
