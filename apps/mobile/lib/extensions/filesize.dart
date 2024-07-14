import 'dart:math';
import 'package:intl/intl.dart';

// NOTE: from https://stackoverflow.com/a/78144099

extension FileFormatter on num {
  // Converts x to a double and returns the common logarithm of the value.
  // WARNING!!! This function is not such accurate as low-level implementation! WARNING!!! Some unit-tests fail because of that!
  // From: https://pub.dev/documentation/dart_numerics/latest/dart_numerics/log10.html
  double log10(num x) => log(x) / ln10;

  String readableFileSize({bool base1024 = false}) {
    if (this <= 0) return '0';

    final base = base1024 ? 1024 : 1000;
    final units = base1024 ? ['Bi', 'KiB', 'MiB', 'GiB', 'TiB'] : ['B', 'kB', 'MB', 'GB', 'TB'];

    final digitGroups = (log10(this) / log10(base)).floor();
    return "${NumberFormat("#,##0.#").format(this / pow(base, digitGroups))} ${units[digitGroups]}";
  }
}
