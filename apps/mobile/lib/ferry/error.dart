import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:gql_exec/gql_exec.dart' as gql show GraphQLError;

part 'error.freezed.dart';

@freezed
sealed class OperationError with _$OperationError {
  const OperationError._();

  const factory OperationError.failure(Exception exception) = OperationFailure;
  const factory OperationError.graphql(gql.GraphQLError graphqlError) =
      GraphQLError;
}
