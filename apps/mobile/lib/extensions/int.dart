import 'package:intl/intl.dart';

final formatter = NumberFormat('#,###');

extension IntX<T> on int {
  String get asFormatted => formatter.format(this);
}
