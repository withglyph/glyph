import 'package:intl/intl.dart';

final formatter = NumberFormat('#,###');

extension IntX<T> on int {
  String get comma => formatter.format(this);
}
