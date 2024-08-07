import 'package:app_tracking_transparency/app_tracking_transparency.dart';
import 'package:appsflyer_sdk/appsflyer_sdk.dart';
import 'package:datadog_flutter_plugin/datadog_flutter_plugin.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:get_it/get_it.dart';
import 'package:glyph/app.dart';
import 'package:glyph/env.dart';
import 'package:glyph/firebase.dart';
import 'package:glyph/firebase_options.dart';
import 'package:glyph/misc/device_id_holder.dart';
import 'package:glyph/routers/app.dart';
import 'package:in_app_purchase/in_app_purchase.dart';
import 'package:jiffy/jiffy.dart';
import 'package:mixpanel_flutter/mixpanel_flutter.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';

Future<void> main() async {
  final widgetsBinding = WidgetsFlutterBinding.ensureInitialized();
  FlutterNativeSplash.preserve(widgetsBinding: widgetsBinding);

  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarBrightness: Brightness.dark,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Colors.transparent,
      systemNavigationBarDividerColor: Colors.transparent,
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );

  await SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  await SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);

  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);

  await Jiffy.setLocale('ko');

  final prefs = await SharedPreferences.getInstance();

  var deviceId = prefs.getString('deviceId');
  if (deviceId == null) {
    deviceId = const Uuid().v4();
    await prefs.setString('deviceId', deviceId);
  }
  DeviceIdHolder.deviceId = deviceId;

  final mixpanel = await Mixpanel.init(Env.mixpanelToken, trackAutomaticEvents: false);

  GetIt.I.registerSingleton<SharedPreferences>(prefs);
  GetIt.I.registerSingleton<FlutterSecureStorage>(
    const FlutterSecureStorage(
      aOptions: AndroidOptions(encryptedSharedPreferences: true, resetOnError: true),
    ),
  );
  GetIt.I.registerSingleton<FirebaseMessaging>(FirebaseMessaging.instance);
  GetIt.I.registerSingleton<InAppPurchase>(InAppPurchase.instance);
  GetIt.I.registerSingleton<Mixpanel>(mixpanel);
  GetIt.I.registerSingleton<AppRouter>(AppRouter());
  GetIt.I.registerSingleton<DatadogSdk>(DatadogSdk.instance);

  await initializeFirebaseMessaging();

  await AppTrackingTransparency.requestTrackingAuthorization();

  final appsflyer = AppsflyerSdk(
    AppsFlyerOptions(
      afDevKey: 'rHRYiSyqraBZ7RYGgw9JRQ',
      appId: '6502156007',
      timeToWaitForATTUserAuthorization: 30,
    ),
  );

  await appsflyer.initSdk(
    registerConversionDataCallback: true,
    registerOnAppOpenAttributionCallback: true,
    registerOnDeepLinkingCallback: true,
  );

  final pkg = await PackageInfo.fromPlatform();

  if (kReleaseMode) {
    await DatadogSdk.instance.initialize(
      DatadogConfiguration(
        clientToken: 'pubc94ed75d0e2608167199b3e9d2af8eee',
        env: Env.current,
        site: DatadogSite.ap1,
        version: '${pkg.version}+${pkg.buildNumber}',
        loggingConfiguration: DatadogLoggingConfiguration(),
        rumConfiguration: DatadogRumConfiguration(
          applicationId: 'c90eed45-f6cb-41b3-8e38-5c3199ac2970',
        ),
      ),
      TrackingConsent.granted,
    );
  }

  await SentryFlutter.init(
    (options) => options
      ..dsn = Env.sentryDsn
      ..environment = Env.current
      ..release = '${pkg.packageName}@${pkg.version}+${pkg.buildNumber}',
    appRunner: () => runApp(const ProviderScope(child: App())),
  );
}
