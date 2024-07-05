import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

class Emoji extends StatelessWidget {
  const Emoji(
    this.data, {
    this.size = 16,
    super.key,
  });

  final EmojiData data;
  final double size;

  @override
  Widget build(BuildContext context) {
    return SvgPicture.asset(
      'assets/emojis/${data.codepoint}.svg',
      width: size,
      height: size,
    );
  }
}

class EmojiData {
  const EmojiData(this.name, this.codepoint);

  final String name;
  final String codepoint;
}
