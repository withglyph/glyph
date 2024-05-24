import 'package:ferry/ferry.dart';
import 'package:glyph/env.dart';
import 'package:glyph/ferry/auth_link.dart';
import 'package:glyph/graphql/__generated__/schema.schema.gql.dart'
    show possibleTypesMap;
import 'package:gql_http_link/gql_http_link.dart';

Client createFerryClient(String? accessToken) {
  final link = Link.from([
    if (accessToken != null) AuthLink(accessToken),
    HttpLink('${Env.baseUrl}/api/graphql'),
  ]);

  final cache = Cache(possibleTypes: possibleTypesMap);

  return Client(link: link, cache: cache, defaultFetchPolicies: {
    OperationType.query: FetchPolicy.CacheAndNetwork,
    OperationType.mutation: FetchPolicy.NetworkOnly,
  });
}
