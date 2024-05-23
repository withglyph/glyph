import airbridge_flutter_sdk
import Flutter
import NaverThirdPartyLogin
import UIKit

@UIApplicationMain
@objc class AppDelegate: FlutterAppDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    GeneratedPluginRegistrant.register(with: self)

    AirbridgeFlutter.initSDK(appName: "withglyph", appToken: "80ab99a9b82145149fd7e24731bf3da9", withLaunchOptions: launchOptions)

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  override func application(
    _ application: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    if NaverThirdPartyLoginConnection.getSharedInstance().application(application, open: url, options: options) {
      return true
    }

    return super.application(application, open: url, options: options)
  }
}
