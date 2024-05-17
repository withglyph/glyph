import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:get_it/get_it.dart';
import 'package:glyph/graphql/__generated__/push_notification_provider.req.gql.dart';
import 'package:glyph/providers/ferry.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:freezed_annotation/freezed_annotation.dart';

part 'push_notification.g.dart';
part 'push_notification.freezed.dart';

@freezed
sealed class PushNotificationState with _$PushNotificationState {
  const PushNotificationState._();

  const factory PushNotificationState.granted({
    required String token,
  }) = Granted;

  const factory PushNotificationState.unavailable() = Unavailable;

  bool get isGranted => this is Granted;
}

@riverpod
class PushNotification extends _$PushNotification {
  final _messaging = GetIt.I<FirebaseMessaging>();

  @override
  Future<PushNotificationState> build() async {
    final token = await _messaging.getToken();
    return switch (token) {
      null => const PushNotificationState.unavailable(),
      _ => PushNotificationState.granted(token: token),
    };
  }

  Future<void> registerToken() async {
    final pushNotification = await future;
    final token = switch (pushNotification) {
      Granted(:final token) => token,
      _ => null,
    };

    if (token == null) {
      return;
    }

    final req =
        GPushNotificationProvider_RegisterPushNotificationToken_MutationReq(
      (b) => b..vars.input.token = token,
    );
    await ref.read(ferryProvider).request(req).first;
  }

  Future<void> clearToken() async {
    await _messaging.deleteToken();

    final pushNotification = await future;
    final token = switch (pushNotification) {
      Granted(:final token) => token,
      _ => null,
    };

    ref.invalidateSelf();

    if (token == null) {
      return;
    }

    final req =
        GPushNotificationProvider_DeletePushNotificationToken_MutationReq(
      (b) => b..vars.input.token = token,
    );
    await ref.read(ferryProvider).request(req).first;
  }
}
