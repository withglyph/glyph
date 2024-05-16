import 'package:gql_http_link/gql_http_link.dart';
import 'package:ferry/ferry.dart';
import 'package:glyph/graphql/__generated__/schema.schema.gql.dart'
    show possibleTypesMap;
import 'package:gql_transform_link/gql_transform_link.dart';

Client createFerryClient(String? accessToken) {
  final link = Link.from([
    TransformLink(requestTransformer: (request) {
      if (accessToken == null) {
        return request;
      }

      return request.updateContextEntry<HttpLinkHeaders>(
        (headers) => HttpLinkHeaders(
          headers: {
            ...headers?.headers ?? <String, String>{},
            "Authorization": accessToken,
          },
        ),
      );
    }),
    // HttpLink('http://localhost:4000/api/graphql'),
    HttpLink('https://withglyph.com/api/graphql'),
  ]);

  final cache = Cache(possibleTypes: possibleTypesMap);

  return Client(link: link, cache: cache);
}
