import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:custom_refresh_indicator/custom_refresh_indicator.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';

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
      offsetToArmed: 60,
      triggerMode: IndicatorTriggerMode.anywhere,
      // ignore: deprecated_member_use
      indicatorFinalizeDuration: const Duration(milliseconds: 200),
      child: child,
      builder: (context, child, controller) {
        print(controller.value);
        return Stack(
          children: [
            Positioned(
              top: 0,
              left: 0,
              right: 0,
              child: Container(
                width: double.infinity,
                height: controller.value * 60,
                clipBehavior: Clip.hardEdge,
                alignment: Alignment.bottomCenter,
                padding: const Pad(bottom: 20),
                decoration: const BoxDecoration(),
                child: FadeTransition(
                  opacity: controller.clamp(0, 1),
                  child: const CupertinoActivityIndicator(),
                ),
              ),
            ),
            Transform.translate(offset: Offset(0, controller.value * 60), child: child),
          ],
        );
      },
    );
  }

  static PullToRefreshListView listView({
    required Future<void> Function() onRefresh,
    required int itemCount,
    required NullableIndexedWidgetBuilder itemBuilder,
    required IndexedWidgetBuilder separatorBuilder,
    required Widget emptyWidget,
  }) {
    return PullToRefreshListView(
      onRefresh: onRefresh,
      itemCount: itemCount,
      itemBuilder: itemBuilder,
      separatorBuilder: separatorBuilder,
      emptyWidget: emptyWidget,
    );
  }
}

class PullToRefreshListView extends StatelessWidget {
  const PullToRefreshListView({
    required this.onRefresh,
    required this.itemCount,
    required this.itemBuilder,
    required this.separatorBuilder,
    required this.emptyWidget,
    super.key,
  });

  final Future<void> Function() onRefresh;
  final NullableIndexedWidgetBuilder itemBuilder;
  final IndexedWidgetBuilder separatorBuilder;
  final int itemCount;
  final Widget emptyWidget;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        return PullToRefresh(
          onRefresh: onRefresh,
          child: itemCount == 0
              ? SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(
                    parent: ClampingScrollPhysics(),
                  ),
                  child: SizedBox(
                    height: constraints.maxHeight,
                    child: emptyWidget,
                  ),
                )
              : ListView.separated(
                  physics: const AlwaysScrollableScrollPhysics(
                    parent: ClampingScrollPhysics(),
                  ),
                  itemCount: itemCount,
                  itemBuilder: itemBuilder,
                  separatorBuilder: separatorBuilder,
                ),
        );
      },
    );
  }
}
