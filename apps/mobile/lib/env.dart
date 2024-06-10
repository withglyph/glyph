class Env {
  static String get _env => const String.fromEnvironment('ENV');

  static String get baseUrl => switch (_env) {
        'dev' => 'https://dev.withglyph.com',
        'release' => 'https://withglyph.com',
        _ => throw Exception('Unknown environment: $_env'),
      };
}
