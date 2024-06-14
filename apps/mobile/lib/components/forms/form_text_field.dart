import 'package:flutter/material.dart';
import 'package:flutter_form_builder/flutter_form_builder.dart';
import 'package:form_builder_validators/form_builder_validators.dart';
import 'package:gap/gap.dart';
import 'package:glyph/themes/colors.dart';

class FormTextField extends StatefulWidget {
  const FormTextField({
    super.key,
    required this.name,
    this.controller,
    this.focusNode,
    this.labelText,
    this.hintText,
    this.autofocus = false,
    this.obscureText = false,
    this.keyboardType,
    this.textInputAction,
    this.validators,
    this.onSubmitted,
  });

  final String name;
  final TextEditingController? controller;
  final FocusNode? focusNode;
  final String? labelText;
  final String? hintText;
  final bool autofocus;
  final bool obscureText;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final List<FormFieldValidator<String>>? validators;
  final ValueChanged<String?>? onSubmitted;

  @override
  createState() => _FormTextFieldState();
}

class _FormTextFieldState extends State<FormTextField>
    with SingleTickerProviderStateMixin {
  late FocusNode _focusNode;
  late AnimationController _animationController;
  late Animation<Color?> _labelColorAnimation;
  late Animation<Color?> _borderColorAnimation;

  bool _ownedFocusNode = false;

  @override
  void initState() {
    super.initState();

    if (widget.focusNode == null) {
      _ownedFocusNode = true;
      _focusNode = FocusNode();
    } else {
      _focusNode = widget.focusNode!;
    }

    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 150),
    );

    _labelColorAnimation = ColorTween(
      begin: BrandColors.gray_400,
      end: BrandColors.brand_400,
    ).animate(_animationController);

    _borderColorAnimation = ColorTween(
      begin: BrandColors.gray_200,
      end: BrandColors.brand_400,
    ).animate(_animationController);

    _focusNode.addListener(() {
      if (_focusNode.hasFocus) {
        _animationController.forward();
      } else {
        _animationController.reverse();
      }
    });

    if (widget.autofocus) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ModalRoute.of(context)!.didPush().then((value) {
          _focusNode.requestFocus();
        });
      });
    }
  }

  @override
  void dispose() {
    if (_ownedFocusNode) {
      _focusNode.dispose();
    }

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (widget.labelText != null) ...[
          AnimatedBuilder(
            animation: _animationController,
            builder: (context, child) {
              return Text(
                widget.labelText!,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w400,
                  color: _labelColorAnimation.value,
                ),
              );
            },
          ),
          const Gap(4),
        ],
        FormBuilderField(
          name: widget.name,
          focusNode: _focusNode,
          validator: widget.validators != null
              ? FormBuilderValidators.compose(widget.validators!)
              : null,
          builder: (field) {
            return TextField(
              controller: widget.controller,
              focusNode: _focusNode,
              autocorrect: false,
              obscureText: widget.obscureText,
              keyboardType: widget.keyboardType,
              textInputAction: widget.textInputAction,
              decoration: InputDecoration(
                isCollapsed: true,
                border: InputBorder.none,
                hintText: widget.hintText,
                hintStyle: const TextStyle(
                  fontWeight: FontWeight.w500,
                  color: BrandColors.gray_400,
                ),
              ),
              cursorColor: BrandColors.brand_400,
              style: const TextStyle(
                fontWeight: FontWeight.w500,
              ),
              onChanged: field.didChange,
              onSubmitted: widget.onSubmitted,
            );
          },
        ),
        const Gap(8),
        AnimatedBuilder(
          animation: _animationController,
          builder: (context, child) {
            return Container(
              height: 1,
              color: _borderColorAnimation.value,
            );
          },
        ),
      ],
    );
  }
}
