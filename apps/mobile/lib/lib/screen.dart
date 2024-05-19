import 'package:flutter_riverpod/flutter_riverpod.dart';

abstract class Screen extends ConsumerWidget {
  const Screen({super.key});
}

abstract class StatefulScreen extends ConsumerStatefulWidget {
  const StatefulScreen({super.key});

  @override
  ScreenState<StatefulScreen> createState();
}

abstract class ScreenState<T extends StatefulScreen> extends ConsumerState<T> {}
