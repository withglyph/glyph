import 'package:auto_route/auto_route.dart';
import 'package:datadog_flutter_plugin/datadog_flutter_plugin.dart';

class DatadogAutoRouteObserver extends DatadogNavigationObserver implements AutoRouterObserver {
  DatadogAutoRouteObserver({required super.datadogSdk});

  @override
  void didInitTabRoute(TabPageRoute route, TabPageRoute? previousRoute) {
    datadogSdk.rum?.startView(route.path, route.name);
  }

  @override
  void didChangeTabRoute(TabPageRoute route, TabPageRoute previousRoute) {
    datadogSdk.rum?.startView(route.path, route.name);
  }
}
