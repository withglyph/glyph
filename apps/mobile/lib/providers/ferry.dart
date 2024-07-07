import 'package:ferry/ferry.dart';
import 'package:ferry/ferry_isolate.dart';
import 'package:glyph/ferry/client.dart';
import 'package:glyph/ferry/error.dart';
import 'package:glyph/providers/auth.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'ferry.g.dart';

@riverpod
class Ferry extends _$Ferry {
  @override
  Future<IsolateClient> build() {
    final authValue = ref.watch(authProvider);
    final accessToken = switch (authValue) {
      AsyncData(value: Authenticated(:final accessToken)) => accessToken,
      _ => null,
    };

    return createFerryClient(accessToken);
  }

  Future<TData> request<TData, TVars>(OperationRequest<TData, TVars> request) async {
    final client = await future;

    OperationResponse<TData, TVars> resp;
    try {
      resp = await client.request(request).first;
    } on Exception catch (e) {
      throw OperationError.failure(e);
    }

    if (resp.linkException != null) {
      throw OperationError.failure(resp.linkException!);
    }

    if (resp.graphqlErrors?.isNotEmpty == true) {
      final error = resp.graphqlErrors![0];
      final appExtension = error.extensions?['__app'];

      throw switch (appExtension?['kind']) {
        'UnknownError' => AppError.unknown(appExtension['extra']['cause']),
        'IntentionalError' => AppError.intentional(error.message),
        'PermissionDeniedError' => const AppError.permissionDenied(),
        'NotFoundError' => const AppError.notFound(),
        'FormValidationError' => AppError.formValidation(
            appExtension['extra']['field'],
            error.message,
          ),
        _ => OperationError.graphql(error),
      };
    }

    return resp.data!;
  }

  Future<void> refetch<TData, TVars>(OperationRequest<TData, TVars> request) async {
    final client = await future;
    return client.addRequestToRequestController(request);
  }
}
