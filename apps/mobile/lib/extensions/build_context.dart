import 'dart:async';

import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';

extension BuildContextX on BuildContext {
  Future<T?> popWaitAndPush<T extends Object?, TO extends Object?>(
    PageRouteInfo route, {
    TO? result,
    OnNavigationFailure? onFailure,
  }) async {
    final router = this.router;
    unawaited(router.maybePop());
    await ModalRoute.of(this)!.completed;
    return router.push(route);
  }
}
