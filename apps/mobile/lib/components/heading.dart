import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/components/svg_icon.dart';
import 'package:glyph/themes/colors.dart';

class Heading extends StatelessWidget implements PreferredSizeWidget {
  const Heading({
    super.key,
    this.leading,
    this.title,
    this.actions,
    this.leadingColor = BrandColors.gray_900,
    this.backgroundColor = BrandColors.gray_0,
    this.fallbackSystemUiOverlayStyle,
    this.titleOnLeft = false,
    this.bottomBorder = true,
  });

  final Widget? leading;
  final Widget? title;
  final List<Widget>? actions;
  final Color? leadingColor;
  final Color? backgroundColor;
  final SystemUiOverlayStyle? fallbackSystemUiOverlayStyle;
  final bool titleOnLeft;
  final bool bottomBorder;

  static const _preferredSize = Size.fromHeight(44);

  @override
  Widget build(BuildContext context) {
    final backgroundColorLuminance = backgroundColor?.computeLuminance();
    final baseSystemUiOverlayStyle = backgroundColorLuminance != null
        ? backgroundColorLuminance > 0.179
            ? SystemUiOverlayStyle.dark
            : SystemUiOverlayStyle.light
        : fallbackSystemUiOverlayStyle ?? SystemUiOverlayStyle.dark;

    return AnnotatedRegion(
      value: baseSystemUiOverlayStyle.copyWith(
        statusBarColor: backgroundColor,
      ),
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: backgroundColor,
        ),
        child: SafeArea(
          child: Container(
            constraints: BoxConstraints.tight(_preferredSize),
            padding: const EdgeInsets.symmetric(horizontal: 20),
            decoration: BoxDecoration(
              border: bottomBorder
                  ? const Border(
                      bottom: BorderSide(
                        color: BrandColors.gray_100,
                      ),
                    )
                  : null,
            ),
            child: NavigationToolbar(
              leading: leading ??
                  AutoLeadingButton(
                    showIfChildCanPop: false,
                    builder: (context, leadingType, action) {
                      if (leadingType == LeadingType.noLeading) {
                        return const SizedBox.shrink();
                      }

                      return Pressable(
                        child: SvgIcon(
                          switch (leadingType) {
                            LeadingType.back => 'arrow-left',
                            LeadingType.close => 'x',
                            _ => throw UnimplementedError(),
                          },
                          color: leadingColor,
                        ),
                        onPressed: () => action?.call(),
                      );
                    },
                  ),
              middle: title,
              centerMiddle: !titleOnLeft,
              trailing: actions == null
                  ? null
                  : Row(mainAxisSize: MainAxisSize.min, children: actions!),
            ),
          ),
        ),
      ),
    );
  }

  @override
  get preferredSize => _preferredSize;

  static PreferredSizeWidget animated({
    required AnimationController animation,
    required Heading Function(BuildContext context) builder,
  }) {
    return PreferredSize(
      preferredSize: _preferredSize,
      child: AnimatedBuilder(
        animation: animation,
        builder: (context, child) => builder(context),
      ),
    );
  }

  static PreferredSizeWidget empty({
    Color? backgroundColor,
    SystemUiOverlayStyle? systemUiOverlayStyle,
  }) {
    return EmptyHeading(
      backgroundColor: backgroundColor,
      fallbackSystemUiOverlayStyle: systemUiOverlayStyle,
    );
  }
}

class EmptyHeading extends StatelessWidget implements PreferredSizeWidget {
  const EmptyHeading({
    super.key,
    this.backgroundColor,
    this.fallbackSystemUiOverlayStyle,
  });

  final Color? backgroundColor;
  final SystemUiOverlayStyle? fallbackSystemUiOverlayStyle;

  @override
  get preferredSize => Size.zero;

  @override
  Widget build(BuildContext context) {
    final backgroundColorLuminance = backgroundColor?.computeLuminance();
    final baseSystemUiOverlayStyle = backgroundColorLuminance != null
        ? backgroundColorLuminance > 0.179
            ? SystemUiOverlayStyle.dark
            : SystemUiOverlayStyle.light
        : fallbackSystemUiOverlayStyle ?? SystemUiOverlayStyle.dark;

    return AnnotatedRegion(
      value: baseSystemUiOverlayStyle.copyWith(
        statusBarColor: backgroundColor,
      ),
      child: ColoredBox(
        color: backgroundColor ?? BrandColors.gray_0,
        child: const SafeArea(
          child: SizedBox.shrink(),
        ),
      ),
    );
  }
}
