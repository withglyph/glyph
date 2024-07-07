import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:glyph/themes/colors.dart';

class EmptyState extends StatelessWidget {
  const EmptyState({
    required this.icon,
    required this.title,
    super.key,
    this.description,
  });

  final IconData icon;
  final String title;
  final String? description;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 40, color: BrandColors.gray_800),
          const Gap(16),
          Text(
            title,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w700,
              color: BrandColors.gray_800,
            ),
          ),
          if (description != null) ...[
            const Gap(4),
            Text(
              description!,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 14,
                color: BrandColors.gray_500,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
