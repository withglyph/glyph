class Env {
  static String get current => const String.fromEnvironment('ENV');

  static String get baseUrl => switch (current) {
        'dev' => 'https://dev.withglyph.com',
        'release' => 'https://withglyph.com',
        _ => throw Exception('Unknown environment: $current'),
      };

  static String get sentryDsn => switch (current) {
        'dev' => '',
        'release' => 'https://5b1117ce3dc48670032783f583c47e7f@o4505385087991808.ingest.us.sentry.io/4507565239238656',
        _ => throw Exception('Unknown environment: $current'),
      };

  static String get mixpanelToken => switch (current) {
        'dev' => '254683f1552a6538df2b4a38f410cd41',
        'release' => 'b7332546f6aea47bde048d073f428cf9',
        _ => throw Exception('Unknown environment: $current'),
      };
}
