import 'package:animate_do/animate_do.dart';
import 'package:ferry/ferry.dart';
import 'package:ferry_flutter/ferry_flutter.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:glyph/providers/ferry.dart';

class GraphQLOperation<TData, TVars> extends ConsumerWidget {
  const GraphQLOperation({
    super.key,
    required this.operation,
    required this.builder,
  });

  final OperationRequest<TData, TVars> operation;
  final Widget Function(BuildContext context, Client client, TData data)
      builder;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ferry = ref.watch(ferryProvider);

    return Operation(
      client: ferry,
      operationRequest: operation,
      builder: (context, response, error) {
        final data = response?.data;

        if (data == null) {
          return const SizedBox.shrink();
        }

        return FadeIn(
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeInOut,
          child: builder(context, ferry, data),
        );

        // return builder(context, ferry, data);
      },
    );
  }
}
