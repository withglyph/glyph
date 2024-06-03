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
      throw OperationError.graphql(resp.graphqlErrors![0]);
    }

    return resp.data!;
  }
}
