import 'dart:async';

import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_form_builder/flutter_form_builder.dart';
import 'package:form_builder_validators/form_builder_validators.dart';
import 'package:gap/gap.dart';
import 'package:glyph/themes/colors.dart';

class FormTextField extends StatefulWidget {
  const FormTextField({
    required this.name,
    super.key,
    this.controller,
    this.focusNode,
    this.labelText,
    this.hintText,
    this.autofocus = false,
    this.obscureText = false,
    this.keyboardType,
    this.textInputAction,
    this.initialValue,
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
  final String? initialValue;
  final List<FormFieldValidator<String>>? validators;
  final ValueChanged<String?>? onSubmitted;

  @override
  createState() => _FormTextFieldState();
}

class _FormTextFieldState extends State<FormTextField> with SingleTickerProviderStateMixin {
  late TextEditingController _controller;
  late FocusNode _focusNode;

  late AnimationController _animationController;
  late Animation<Color?> _labelColorAnimation;
  late Animation<Color?> _borderColorAnimation;

  bool _ownedController = false;
  bool _ownedFocusNode = false;

  @override
  void initState() {
    super.initState();

    if (widget.controller == null) {
      _ownedController = true;
      _controller = TextEditingController(text: widget.initialValue);
    } else {
      _controller = widget.controller!;
    }

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
      begin: BrandColors.gray_500,
      end: BrandColors.gray_900,
    ).animate(_animationController);

    _borderColorAnimation = ColorTween(
      begin: BrandColors.gray_200,
      end: BrandColors.gray_900,
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
        unawaited(
          ModalRoute.of(context)!.didPush().then((value) {
            _focusNode.requestFocus();
          }),
        );
      });
    }
  }

  @override
  void dispose() {
    if (_ownedController) {
      _controller.dispose();
    }

    if (_ownedFocusNode) {
      _focusNode.dispose();
    }

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FormBuilderField(
      name: widget.name,
      focusNode: _focusNode,
      initialValue: widget.initialValue,
      validator: widget.validators != null ? FormBuilderValidators.compose(widget.validators!) : null,
      builder: (field) {
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
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: field.hasError ? BrandColors.red_600 : _labelColorAnimation.value,
                    ),
                  );
                },
              ),
              const Gap(13),
            ],
            TextField(
              controller: _controller,
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
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: BrandColors.gray_400,
                ),
              ),
              cursorColor: BrandColors.gray_900,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
              ),
              onChanged: (value) {
                field
                  ..didChange(value)
                  ..validate();
              },
              onSubmitted: widget.onSubmitted,
            ),
            const Gap(4),
            AnimatedBuilder(
              animation: _animationController,
              builder: (context, child) {
                return Box(
                  height: 1.5,
                  color: field.hasError ? BrandColors.red_600 : _borderColorAnimation.value,
                );
              },
            ),
            if (field.hasError) ...[
              const Gap(6.5),
              Text(
                field.errorText!,
                style: const TextStyle(
                  fontSize: 11,
                  color: BrandColors.red_600,
                ),
              ),
            ],
          ],
        );
      },
    );
  }
}
