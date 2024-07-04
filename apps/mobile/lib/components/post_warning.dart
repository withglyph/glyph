import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/btn.dart';
import 'package:glyph/icons/tabler_bold.dart';
import 'package:glyph/themes/colors.dart';

class PostWarning extends StatelessWidget {
  const PostWarning({
    required this.title,
    required this.description,
    required this.onPressed,
    super.key,
    this.buttonTitle = '포스트 보기',
  });

  final String title;
  final String description;
  final String buttonTitle;
  final void Function()? onPressed;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const Pad(vertical: 80),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 300),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                TablerBold.alert_triangle,
                size: 34,
                color: Color(0xFFFFC750),
              ),
              const Gap(10),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: BrandColors.gray_800,
                ),
              ),
              const Gap(4),
              Text(
                description,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 14,
                  color: BrandColors.gray_500,
                ),
              ),
              const Gap(24),
              ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 254),
                child: Btn(buttonTitle, onPressed: onPressed),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
