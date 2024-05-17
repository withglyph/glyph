import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:get_it/get_it.dart';
import 'package:glyph/ferry/client.dart';
import 'package:glyph/graphql/__generated__/auth_provider_query.req.gql.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:freezed_annotation/freezed_annotation.dart';

part 'auth.g.dart';
part 'auth.freezed.dart';

@freezed
sealed class AuthState with _$AuthState {
  const AuthState._();

  const factory AuthState.authenticated({
    required String accessToken,
  }) = Authenticated;

  const factory AuthState.unauthenticated() = Unauthenticated;

  bool get isAuthenticated => this is Authenticated;
}

@riverpod
class Auth extends _$Auth {
  final _storage = GetIt.I<FlutterSecureStorage>();
  final _storageKey = 'access_token';

  @override
  Future<AuthState> build() async {
    final accessToken = await _storage.read(key: _storageKey);

    if (accessToken == null) {
      return const AuthState.unauthenticated();
    } else {
      final ferry = createFerryClient(accessToken);
      final req = GAuthProvider_QueryReq();
      final resp =
          await ferry.request(req).firstWhere((resp) => resp.data != null);

      if (resp.data!.me == null) {
        await _storage.delete(key: _storageKey);
        return const AuthState.unauthenticated();
      }

      return AuthState.authenticated(accessToken: accessToken);
    }
  }

  Future<void> setAccessToken(String value) async {
    await _storage.write(key: _storageKey, value: value);
    state = AsyncData(AuthState.authenticated(accessToken: value));
  }

  Future<void> clearAccessToken() async {
    await _storage.delete(key: _storageKey);
    state = const AsyncData(AuthState.unauthenticated());
  }
}
