import 'package:ferry/ferry.dart';
import 'package:gql_exec/gql_exec.dart' as gql_exec;

class DeviceIdLink extends Link {
  DeviceIdLink(this.deviceId);
  final String deviceId;

  @override
  Stream<gql_exec.Response> request(
    gql_exec.Request request, [
    NextLink? forward,
  ]) async* {
    assert(forward != null);
    final newReq = gql_exec.Request(
      operation: request.operation,
      variables: request.variables,
      context: request.context.updateEntry<gql_exec.HttpLinkHeaders>(
        (headers) => gql_exec.HttpLinkHeaders(
          headers: {
            ...?headers?.headers,
            'Cookie': 'glyph-did=$deviceId',
          },
        ),
      ),
    );
    yield* forward!(newReq);
  }
}
