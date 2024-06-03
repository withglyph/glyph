import 'dart:async';

import 'package:animate_do/animate_do.dart';
import 'package:ferry/ferry.dart';
import 'package:ferry_flutter/ferry_flutter.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:glyph/providers/ferry.dart';

class GraphQLOperation<TData, TVars> extends ConsumerStatefulWidget {
  const GraphQLOperation({
    super.key,
    required this.operation,
    required this.builder,
    this.onDataLoaded,
  });

  final OperationRequest<TData, TVars> operation;
  final Widget Function(BuildContext context, Client client, TData data)
      builder;
  final FutureOr<void> Function(
      BuildContext context, Client client, TData data)? onDataLoaded;

  @override
  createState() => _GraphQLOperationState<TData, TVars>();
}

class _GraphQLOperationState<TData, TVars>
    extends ConsumerState<GraphQLOperation<TData, TVars>> {
  bool _loaded = false;

  @override
  Widget build(BuildContext context) {
    final client = ref.watch(ferryProvider);

    return Operation(
      client: client,
      operationRequest: widget.operation,
      builder: (context, response, error) {
        final data = response?.data;

        if (response!.graphqlErrors?.isNotEmpty == true) {
          throw response.graphqlErrors!.first;
        }

        if (response.linkException != null) {
          throw response.linkException!;
        }

        if (data == null) {
          return const SizedBox.shrink();
        }

        if (!_loaded) {
          _loaded = true;
          WidgetsBinding.instance.addPostFrameCallback((_) {
            widget.onDataLoaded?.call(context, client, data);
          });
        }

        return FadeIn(
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeInOut,
          child: widget.builder(context, client, data),
        );
      },
    );
  }
}
