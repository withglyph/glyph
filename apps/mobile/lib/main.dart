import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
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
  GetIt.I.registerSingleton<FlutterSecureStorage>(const FlutterSecureStorage());
  GetIt.I.registerSingleton<FirebaseMessaging>(FirebaseMessaging.instance);
  GetIt.I.registerSingleton<InAppPurchase>(InAppPurchase.instance);
  GetIt.I.registerSingleton<Mixpanel>(mixpanel);
  GetIt.I.registerSingleton<AppRouter>(AppRouter());

  await initializeFirebaseMessaging();

  runApp(const ProviderScope(child: App()));
}
