import 'package:ferry/ferry.dart';
import 'package:gql_exec/gql_exec.dart' as gql_exec;

class AuthLink extends Link {
  final String accessToken;

  AuthLink(this.accessToken);

  @override
  Stream<gql_exec.Response> request(gql_exec.Request request,
      [NextLink? forward]) async* {
    assert(forward != null);
    final newReq = gql_exec.Request(
        operation: request.operation,
        variables: request.variables,
        context: request.context.updateEntry<gql_exec.HttpLinkHeaders>(
          (headers) => gql_exec.HttpLinkHeaders(headers: {
            ...?headers?.headers,
            'Authorization': accessToken,
          }),
        ));
    yield* forward!(newReq);
  }
}
