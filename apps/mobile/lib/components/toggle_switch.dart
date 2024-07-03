import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:flutter/material.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/themes/colors.dart';

class ToggleSwitch extends StatefulWidget {
  const ToggleSwitch({
    required this.value,
    super.key,
    this.onChanged,
  });

  final bool value;
  // ignore: avoid_positional_boolean_parameters
  final Function(bool value)? onChanged;

  @override
  createState() => _ToggleSwitchState();
}

class _ToggleSwitchState extends State<ToggleSwitch> with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<Color?> _thumbColorAnimation;
  late Animation<AlignmentGeometry> _thumbAlignmentAnimation;

  @override
  void initState() {
    super.initState();

    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 150),
      value: widget.value ? 1 : 0,
    );

    final curve = CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    );

    _thumbColorAnimation = ColorTween(
      begin: BrandColors.gray_200,
      end: BrandColors.brand_400,
    ).animate(curve);

    _thumbAlignmentAnimation = AlignmentTween(
      begin: Alignment.centerLeft,
      end: Alignment.centerRight,
    ).animate(curve);
  }

  @override
  void didUpdateWidget(covariant ToggleSwitch oldWidget) {
    super.didUpdateWidget(oldWidget);

    if (widget.value != oldWidget.value) {
      if (widget.value) {
        _animationController.forward();
      } else {
        _animationController.reverse();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Pressable(
      child: AnimatedBuilder(
        animation: _animationController,
        builder: (context, child) {
          return Container(
            width: 40,
            height: 22,
            padding: const Pad(all: 2),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(11),
              color: _thumbColorAnimation.value,
            ),
            child: Align(
              alignment: _thumbAlignmentAnimation.value,
              child: Container(
                width: 18,
                height: 18,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(9),
                  color: BrandColors.gray_0,
                ),
              ),
            ),
          );
        },
      ),
      onPressed: () {
        widget.onChanged?.call(!widget.value);
      },
    );
  }
}
