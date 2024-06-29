import 'package:flutter_native_splash/flutter_native_splash.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:get_it/get_it.dart';
import 'package:glyph/ferry/client.dart';
import 'package:glyph/graphql/__generated__/auth_provider_logout_user_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/auth_provider_query.data.gql.dart';
import 'package:glyph/graphql/__generated__/auth_provider_query.req.gql.dart';
import 'package:mixpanel_flutter/mixpanel_flutter.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'auth.freezed.dart';
part 'auth.g.dart';

@freezed
sealed class AuthState with _$AuthState {
  const AuthState._();

  const factory AuthState.authenticated({
    required String accessToken,
    required GAuthProvider_QueryData_me me,
  }) = Authenticated;

  const factory AuthState.unauthenticated() = Unauthenticated;

  bool get isAuthenticated => this is Authenticated;
}

@riverpod
class Auth extends _$Auth {
  final _mixpanel = GetIt.I<Mixpanel>();
  final _storage = GetIt.I<FlutterSecureStorage>();
  final _storageKey = 'access_token';

  @override
  Future<AuthState> build() async {
    final accessToken = await _storage.read(key: _storageKey);

    final state =
        accessToken == null ? const AuthState.unauthenticated() : await _validateTokenAndCreateState(accessToken);

    FlutterNativeSplash.remove();

    return state;
  }

  Future<void> setAccessToken(String value) async {
    await _storage.write(key: _storageKey, value: value);

    state = AsyncData(await _validateTokenAndCreateState(value));
  }

  Future<void> clearAccessToken() async {
    final auth = await future;
    final accessToken = switch (auth) {
      Authenticated(:final accessToken) => accessToken,
      _ => null,
    };

    if (accessToken != null) {
      final ferry = createFerryClient(accessToken);

      final req = GAuthProvider_LogoutUser_MutationReq();
      await ferry.request(req).first;
    }

    await _storage.delete(key: _storageKey);

    state = const AsyncData(AuthState.unauthenticated());
  }

  Future<AuthState> _validateTokenAndCreateState(String accessToken) async {
    final ferry = createFerryClient(accessToken);
    final req = GAuthProvider_QueryReq();
    final resp = await ferry.request(req).firstWhere((resp) => resp.data != null);

    if (resp.data!.me == null) {
      await _storage.delete(key: _storageKey);

      return const AuthState.unauthenticated();
    } else {
      _mixpanel.identify(resp.data!.me!.id);
      _mixpanel.getPeople()
        ..set(r'$email', resp.data!.me!.email)
        ..set(r'$name', resp.data!.me!.profile.name)
        ..set(r'$avatar', resp.data!.me!.profile.avatar.url);

      return AuthState.authenticated(
        accessToken: accessToken,
        me: resp.data!.me!,
      );
    }
  }
}
