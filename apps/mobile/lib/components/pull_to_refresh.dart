import 'package:custom_refresh_indicator/custom_refresh_indicator.dart';
import 'package:flutter/material.dart';
import 'package:glyph/themes/colors.dart';

class PullToRefresh extends StatelessWidget {
  const PullToRefresh({
    required this.child,
    required this.onRefresh,
    super.key,
  });

  final Widget child;
  final Future<void> Function() onRefresh;

  @override
  Widget build(BuildContext context) {
    return CustomRefreshIndicator(
      onRefresh: () async {
        await Future.wait([
          onRefresh(),
          Future.delayed(const Duration(seconds: 1)),
        ]);
      },
      // ignore: deprecated_member_use
      indicatorFinalizeDuration: const Duration(milliseconds: 200),
      child: child,
      builder: (context, child, controller) {
        return Stack(
          children: [
            child,
            Positioned(
              top: 0,
              left: 0,
              right: 0,
              child: AnimatedBuilder(
                animation: controller,
                builder: (context, child) {
                  return Opacity(
                    opacity: controller.value.clamp(0, 1),
                    child: LinearProgressIndicator(
                      value: controller.isDragging || controller.isArmed
                          ? controller.value.clamp(0, 1)
                          : null,
                      backgroundColor: BrandColors.gray_150,
                      color: BrandColors.gray_900,
                    ),
                  );
                },
              ),
            ),
          ],
        );
      },
    );
  }

  static PullToRefreshListView listView({
    required Future<void> Function() onRefresh,
    required int itemCount,
    required NullableIndexedWidgetBuilder itemBuilder,
    required String emptyText,
  }) {
    return PullToRefreshListView(
      onRefresh: onRefresh,
      itemCount: itemCount,
      itemBuilder: itemBuilder,
      emptyText: emptyText,
    );
  }
}

class PullToRefreshListView extends StatelessWidget {
  const PullToRefreshListView({
    required this.onRefresh,
    required this.itemCount,
    required this.itemBuilder,
    required this.emptyText,
    super.key,
  });

  final Future<void> Function() onRefresh;
  final NullableIndexedWidgetBuilder itemBuilder;
  final int itemCount;
  final String emptyText;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        return PullToRefresh(
          onRefresh: onRefresh,
          child: itemCount == 0
              ? SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  child: ConstrainedBox(
                    constraints: BoxConstraints(
                      minHeight: constraints.maxHeight,
                    ),
                    child: Center(
                      child: Text(
                        emptyText,
                        style: const TextStyle(
                          fontSize: 15,
                          color: BrandColors.gray_500,
                        ),
                      ),
                    ),
                  ),
                )
              : ListView.builder(
                  physics: const AlwaysScrollableScrollPhysics(),
                  itemCount: itemCount,
                  itemBuilder: itemBuilder,
                ),
        );
      },
    );
  }
}
