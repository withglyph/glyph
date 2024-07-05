import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:glyph/components/horizontal_divider.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/icons/tabler.dart';
import 'package:glyph/themes/colors.dart';

extension ModalX on BuildContext {
  Future<T> showFullScreenModal<T>({
    required WidgetBuilder builder,
    String? title,
  }) async {
    return await showModalBottomSheet(
      context: this,
      backgroundColor: BrandColors.gray_0,
      barrierColor: Colors.black.withOpacity(0.2),
      elevation: 0,
      isScrollControlled: true,
      useSafeArea: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(20),
        ),
      ),
      clipBehavior: Clip.antiAlias,
      builder: (context) {
        final child = builder(context);

        return Scaffold(
          body: SafeArea(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                SizedBox(
                  width: double.infinity,
                  height: title == null ? 20 : 56,
                  child: Stack(
                    children: [
                      if (title != null) ...[
                        NavigationToolbar(
                          middle: Text(
                            title,
                            style: const TextStyle(
                              fontSize: 17,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          trailing: Padding(
                            padding: const Pad(right: 20),
                            child: Pressable(
                              child: const Icon(Tabler.x),
                              onPressed: () async {
                                await context.router.maybePop();
                              },
                            ),
                          ),
                        ),
                        const Positioned(
                          left: 0,
                          right: 0,
                          bottom: 0,
                          child: HorizontalDivider(color: BrandColors.gray_50),
                        ),
                      ],
                      Positioned(
                        left: 0,
                        right: 0,
                        top: 4,
                        child: Center(
                          child: Container(
                            width: 40,
                            height: 4,
                            decoration: BoxDecoration(
                              color: BrandColors.gray_150,
                              borderRadius: BorderRadius.circular(2),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                Expanded(child: child),
              ],
            ),
          ),
        );
      },
    );
  }
}
