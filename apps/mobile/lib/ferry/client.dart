import 'dart:isolate';

import 'package:ferry/ferry.dart';
import 'package:ferry/ferry_isolate.dart';
import 'package:glyph/env.dart';
import 'package:glyph/ferry/auth_link.dart';
import 'package:glyph/ferry/device_id_link.dart';
import 'package:glyph/graphql/__generated__/schema.schema.gql.dart' show possibleTypesMap;
import 'package:glyph/misc/device_id_holder.dart';
import 'package:gql_http_link/gql_http_link.dart';

Future<IsolateClient> createFerryClient(String? accessToken) async {
  return IsolateClient.create(
    _createClient,
    params: _CreateClientParams(
      accessToken: accessToken,
      deviceId: DeviceIdHolder.deviceId,
    ),
  );
}

class _CreateClientParams {
  const _CreateClientParams({
    required this.accessToken,
    required this.deviceId,
  });

  final String? accessToken;
  final String deviceId;
}

Future<Client> _createClient(_CreateClientParams params, SendPort? sendPort) async {
  final link = Link.from([
    if (params.accessToken != null) AuthLink(params.accessToken!),
    DeviceIdLink(params.deviceId),
    HttpLink('${Env.baseUrl}/api/graphql'),
  ]);

  final cache = Cache(possibleTypes: possibleTypesMap);

  return Client(
    link: link,
    cache: cache,
    defaultFetchPolicies: {
      OperationType.query: FetchPolicy.CacheAndNetwork,
      OperationType.mutation: FetchPolicy.NetworkOnly,
    },
  );
}
