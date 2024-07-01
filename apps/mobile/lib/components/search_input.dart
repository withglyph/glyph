import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/icons/glyph.dart';
import 'package:glyph/icons/tabler.dart';
import 'package:glyph/themes/colors.dart';

class SearchInput extends StatefulWidget {
  const SearchInput({
    super.key,
    this.action,
    this.placeholder = '검색어를 입력해주세요',
    this.onSearch,
    this.initialValue = '',
  });

  final Widget? action;
  final String placeholder;
  final Function(String value, TextEditingController controller)? onSearch;
  final String initialValue;

  @override
  createState() => _SearchInputState();
}

class _SearchInputState extends State<SearchInput> {
  final _controller = TextEditingController();

  @override
  void initState() {
    super.initState();
    _controller.text = widget.initialValue;
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        if (widget.action != null) ...[widget.action!, const Gap(6)],
        Expanded(
          child: TextField(
            controller: _controller,
            onChanged: (value) {
              setState(() {});
            },
            onSubmitted: (value) async {
              if (value.isNotEmpty) {
                await widget.onSearch?.call(value, _controller);
                setState(() {});
              }
            },
            textInputAction: TextInputAction.search,
            decoration: InputDecoration(
              isDense: true,
              filled: true,
              fillColor: BrandColors.gray_50,
              hintText: widget.placeholder,
              hintStyle: const TextStyle(color: BrandColors.gray_400),
              prefixIcon: const Padding(
                padding: EdgeInsets.fromLTRB(12, 11, 6, 11),
                child: Icon(
                  Glyph.search,
                  size: 16,
                  color: BrandColors.gray_400,
                ),
              ),
              prefixIconConstraints: BoxConstraints.tight(const Size(34, 38)),
              suffixIcon: _controller.text.isNotEmpty
                  ? Pressable(
                      onPressed: () {
                        _controller.clear();
                        setState(() {});
                      },
                      child: const Icon(
                        Tabler.circle_x_filled,
                        size: 16,
                        color: BrandColors.gray_400,
                      ),
                    )
                  : Container(),
              suffixIconConstraints: BoxConstraints.tight(const Size(38, 38)),
              contentPadding: const EdgeInsets.symmetric(vertical: 8),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(4),
                borderSide: BorderSide.none,
              ),
            ),
            style: const TextStyle(fontSize: 15),
          ),
        ),
      ],
    );
  }
}
