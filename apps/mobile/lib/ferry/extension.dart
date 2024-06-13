import 'package:ferry/ferry.dart';
import 'package:glyph/ferry/error.dart';

extension ClientX on Client {
  Future<TData> req<TData, TVars>(
      OperationRequest<TData, TVars> operationRequest) async {
    OperationResponse<TData, TVars> resp;
    try {
      resp = await request(operationRequest).first;
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
}
