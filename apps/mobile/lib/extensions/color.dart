import 'dart:ui';

extension HexColor on Color {
  static Color fromHex(String hexString) {
    final hexBody = hexString.replaceFirst('#', '');

    final buffer = StringBuffer();

    // write AA
    if (hexBody.length == 6) {
      // #RRGGBB
      buffer.write('ff');
    } else {
      // #RRGGBBAA
      buffer.write(hexBody.substring(6, 8));
    }

    // write RRGGBB
    buffer.write(hexBody.substring(0, 6));

    // parse AARRGGBB
    return Color(int.parse(buffer.toString(), radix: 16));
  }
}
