class Env {
  static String get current => const String.fromEnvironment('ENV');

  static String get baseUrl => switch (current) {
        // 'dev' => 'https://dev.withglyph.com',
        'dev' => 'http://localhost:4000',
        'release' => 'https://staging.withglyph.com',
        _ => throw Exception('Unknown environment: $current'),
      };

  static String get mixpanelToken => switch (current) {
        'dev' => '254683f1552a6538df2b4a38f410cd41',
        'release' => 'b7332546f6aea47bde048d073f428cf9',
        _ => throw Exception('Unknown environment: $current'),
      };
}
