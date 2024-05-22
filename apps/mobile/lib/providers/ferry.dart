import 'package:ferry/ferry.dart';
import 'package:glyph/ferry/client.dart';
import 'package:glyph/providers/auth.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'ferry.g.dart';

@riverpod
Client ferry(FerryRef ref) {
  final authValue = ref.watch(authProvider);
  final accessToken = switch (authValue) {
    AsyncData(value: Authenticated(:final accessToken)) => accessToken,
    _ => null,
  };

  ref.keepAlive();

  return createFerryClient(accessToken);
}
