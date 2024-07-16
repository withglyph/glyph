import 'dart:async';

import 'package:ferry/ferry.dart';
import 'package:ferry_flutter/ferry_flutter.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:glyph/ferry/error.dart';
import 'package:glyph/providers/auth.dart';
import 'package:glyph/providers/ferry.dart';

class GraphQLOperation<TData, TVars> extends ConsumerStatefulWidget {
  const GraphQLOperation({
    required this.operation,
    required this.builder,
    this.onDataLoaded,
    this.requireAuth = true,
    super.key,
  });

  final OperationRequest<TData, TVars> operation;
  final Widget Function(BuildContext context, Ferry client, TData data) builder;
  final FutureOr<void> Function(BuildContext context, Ferry client, TData data)? onDataLoaded;
  final bool requireAuth;

  @override
  createState() => _GraphQLOperationState<TData, TVars>();
}

class _GraphQLOperationState<TData, TVars> extends ConsumerState<GraphQLOperation<TData, TVars>>
    with SingleTickerProviderStateMixin {
  late final AnimationController _animationController;
  late final Animation<double> _opacityAnimation;

  bool _loaded = false;

  @override
  void initState() {
    super.initState();

    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 200),
    );

    final curve = CurvedAnimation(parent: _animationController, curve: Curves.easeInOut);
    _opacityAnimation = Tween<double>(begin: 0, end: 1).animate(curve);
  }

  @override
  void dispose() {
    _animationController.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final asyncAuth = ref.watch(authProvider);
    final asyncClient = ref.watch(ferryProvider);
    final notifier = ref.watch(ferryProvider.notifier);

    final client = asyncClient.unwrapPrevious().valueOrNull;
    if (client == null) {
      return const SizedBox.shrink();
    }

    final auth = asyncAuth.unwrapPrevious().valueOrNull;
    if (widget.requireAuth && auth is! Authenticated) {
      return const SizedBox.shrink();
    }

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
            if (!mounted) {
              return;
            }

            unawaited(_animationController.forward());
            widget.onDataLoaded?.call(context, notifier, data);
          });
        }

        return FadeTransition(
          opacity: _opacityAnimation,
          child: widget.builder(context, notifier, data),
        );
      },
    );
  }
}
