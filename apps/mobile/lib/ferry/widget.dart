import 'dart:async';

import 'package:animate_do/animate_do.dart';
import 'package:ferry/ferry.dart';
import 'package:ferry_flutter/ferry_flutter.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:glyph/ferry/error.dart';
import 'package:glyph/providers/ferry.dart';

class GraphQLOperation<TData, TVars> extends ConsumerStatefulWidget {
  const GraphQLOperation({
    required this.operation,
    required this.builder,
    super.key,
    this.onDataLoaded,
  });

  final OperationRequest<TData, TVars> operation;
  final Widget Function(BuildContext context, Client client, TData data) builder;
  final FutureOr<void> Function(BuildContext context, Client client, TData data)? onDataLoaded;

  @override
  createState() => _GraphQLOperationState<TData, TVars>();
}

class _GraphQLOperationState<TData, TVars> extends ConsumerState<GraphQLOperation<TData, TVars>> {
  bool _loaded = false;

  @override
  Widget build(BuildContext context) {
    final client = ref.watch(ferryProvider);

    return Operation(
      client: client,
      operationRequest: widget.operation,
      builder: (context, response, error) {
        final data = response?.data;

        if (response?.linkException != null) {
          throw OperationError.failure(response!.linkException!);
        }

        if (response!.graphqlErrors?.isNotEmpty == true) {
          final error = response.graphqlErrors![0];
          final appExtension = error.extensions?['__app'];

          throw switch (appExtension?['kind']) {
            'UnknownError' => AppError.unknown(appExtension['extra']['cause']),
            'IntentionalError' => AppError.intentional(error.message),
            'PermissionDeniedError' => const AppError.permissionDenied(),
            'NotFoundError' => const AppError.notFound(),
            'FormValidationError' => AppError.formValidation(appExtension['extra']['field'], error.message),
            _ => OperationError.graphql(error),
          };
        }

        if (data == null) {
          return const SizedBox.shrink();
        }

        if (!_loaded) {
          _loaded = true;
          WidgetsBinding.instance.addPostFrameCallback((_) async {
            await widget.onDataLoaded?.call(context, client, data);
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
