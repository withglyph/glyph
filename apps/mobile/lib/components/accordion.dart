import 'package:flutter/material.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/icons/tabler.dart';
import 'package:glyph/themes/colors.dart';

class Accordion extends StatefulWidget {
  const Accordion({
    required this.title,
    required this.child,
    super.key,
    this.initiallyExpanded = false,
  });

  final String title;
  final Widget child;
  final bool initiallyExpanded;

  @override
  createState() => _AccordionState();
}

class _AccordionState extends State<Accordion> with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _heightAnimation;

  bool isExpanded = false;

  @override
  void initState() {
    super.initState();

    isExpanded = widget.initiallyExpanded;

    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 150),
      value: isExpanded ? 1 : 0,
    );

    final curve = CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    );

    _heightAnimation = Tween<double>(
      begin: 0,
      end: 1,
    ).animate(curve);
  }

  @override
  void didUpdateWidget(covariant Accordion oldWidget) {
    super.didUpdateWidget(oldWidget);

    if (widget.initiallyExpanded != oldWidget.initiallyExpanded) {
      if (widget.initiallyExpanded) {
        _animationController.forward();
      } else {
        _animationController.reverse();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _heightAnimation,
      builder: (context, child) {
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Column(
            children: [
              Pressable(
                onPressed: () {
                  setState(() {
                    isExpanded = !isExpanded;
                    if (isExpanded) {
                      _animationController.forward();
                    } else {
                      _animationController.reverse();
                    }
                  });
                },
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        widget.title,
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      Icon(
                        isExpanded ? Tabler.chevron_up : Tabler.chevron_down,
                        color: BrandColors.gray_500,
                        size: 16,
                      ),
                    ],
                  ),
                ),
              ),
              ClipRect(
                child: Align(
                  heightFactor: _heightAnimation.value,
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 28),
                    child: child,
                  ),
                ),
              ),
            ],
          ),
        );
      },
      child: widget.child,
    );
  }
}
