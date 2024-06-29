import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:gql_exec/gql_exec.dart' as gql show GraphQLError;

part 'error.freezed.dart';

@freezed
sealed class OperationError with _$OperationError implements Exception {
  const OperationError._();

  const factory OperationError.failure(Exception exception) = OperationFailure;
  const factory OperationError.graphql(gql.GraphQLError error) = GraphQLError;
}

@freezed
sealed class AppError with _$AppError implements Exception {
  const AppError._();

  const factory AppError.unknown(dynamic cause) = UnknownError;
  const factory AppError.intentional(String message) = IntentionalError;
  const factory AppError.permissionDenied() = PermissionDeniedError;
  const factory AppError.notFound() = NotFoundError;
  const factory AppError.formValidation(String field, String message) = FormValidationError;
}
