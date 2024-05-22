import 'package:ferry/ferry.dart';

extension ClientX on Client {
  Future<TData> req<TData, TVars>(
      OperationRequest<TData, TVars> operationRequest) async {
    final resp =
        await request(operationRequest).firstWhere((value) => !value.loading);

    if (resp.linkException != null) {
      throw resp.linkException!;
    }

    if (resp.graphqlErrors?.isNotEmpty == true) {
      throw resp.graphqlErrors![0];
    }

    return resp.data!;
  }
}
