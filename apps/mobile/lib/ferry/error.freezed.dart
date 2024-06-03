// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'error.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

/// @nodoc
mixin _$OperationError {
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function(Exception exception) failure,
    required TResult Function(gql.GraphQLError graphqlError) graphql,
  }) =>
      throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function(Exception exception)? failure,
    TResult? Function(gql.GraphQLError graphqlError)? graphql,
  }) =>
      throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function(Exception exception)? failure,
    TResult Function(gql.GraphQLError graphqlError)? graphql,
    required TResult orElse(),
  }) =>
      throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(OperationFailure value) failure,
    required TResult Function(GraphQLError value) graphql,
  }) =>
      throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(OperationFailure value)? failure,
    TResult? Function(GraphQLError value)? graphql,
  }) =>
      throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(OperationFailure value)? failure,
    TResult Function(GraphQLError value)? graphql,
    required TResult orElse(),
  }) =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $OperationErrorCopyWith<$Res> {
  factory $OperationErrorCopyWith(
          OperationError value, $Res Function(OperationError) then) =
      _$OperationErrorCopyWithImpl<$Res, OperationError>;
}

/// @nodoc
class _$OperationErrorCopyWithImpl<$Res, $Val extends OperationError>
    implements $OperationErrorCopyWith<$Res> {
  _$OperationErrorCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;
}

/// @nodoc
abstract class _$$OperationFailureImplCopyWith<$Res> {
  factory _$$OperationFailureImplCopyWith(_$OperationFailureImpl value,
          $Res Function(_$OperationFailureImpl) then) =
      __$$OperationFailureImplCopyWithImpl<$Res>;
  @useResult
  $Res call({Exception exception});
}

/// @nodoc
class __$$OperationFailureImplCopyWithImpl<$Res>
    extends _$OperationErrorCopyWithImpl<$Res, _$OperationFailureImpl>
    implements _$$OperationFailureImplCopyWith<$Res> {
  __$$OperationFailureImplCopyWithImpl(_$OperationFailureImpl _value,
      $Res Function(_$OperationFailureImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? exception = null,
  }) {
    return _then(_$OperationFailureImpl(
      null == exception
          ? _value.exception
          : exception // ignore: cast_nullable_to_non_nullable
              as Exception,
    ));
  }
}

/// @nodoc

class _$OperationFailureImpl extends OperationFailure {
  const _$OperationFailureImpl(this.exception) : super._();

  @override
  final Exception exception;

  @override
  String toString() {
    return 'OperationError.failure(exception: $exception)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$OperationFailureImpl &&
            (identical(other.exception, exception) ||
                other.exception == exception));
  }

  @override
  int get hashCode => Object.hash(runtimeType, exception);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$OperationFailureImplCopyWith<_$OperationFailureImpl> get copyWith =>
      __$$OperationFailureImplCopyWithImpl<_$OperationFailureImpl>(
          this, _$identity);

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function(Exception exception) failure,
    required TResult Function(gql.GraphQLError graphqlError) graphql,
  }) {
    return failure(exception);
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function(Exception exception)? failure,
    TResult? Function(gql.GraphQLError graphqlError)? graphql,
  }) {
    return failure?.call(exception);
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function(Exception exception)? failure,
    TResult Function(gql.GraphQLError graphqlError)? graphql,
    required TResult orElse(),
  }) {
    if (failure != null) {
      return failure(exception);
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(OperationFailure value) failure,
    required TResult Function(GraphQLError value) graphql,
  }) {
    return failure(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(OperationFailure value)? failure,
    TResult? Function(GraphQLError value)? graphql,
  }) {
    return failure?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(OperationFailure value)? failure,
    TResult Function(GraphQLError value)? graphql,
    required TResult orElse(),
  }) {
    if (failure != null) {
      return failure(this);
    }
    return orElse();
  }
}

abstract class OperationFailure extends OperationError {
  const factory OperationFailure(final Exception exception) =
      _$OperationFailureImpl;
  const OperationFailure._() : super._();

  Exception get exception;
  @JsonKey(ignore: true)
  _$$OperationFailureImplCopyWith<_$OperationFailureImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class _$$GraphQLErrorImplCopyWith<$Res> {
  factory _$$GraphQLErrorImplCopyWith(
          _$GraphQLErrorImpl value, $Res Function(_$GraphQLErrorImpl) then) =
      __$$GraphQLErrorImplCopyWithImpl<$Res>;
  @useResult
  $Res call({gql.GraphQLError graphqlError});
}

/// @nodoc
class __$$GraphQLErrorImplCopyWithImpl<$Res>
    extends _$OperationErrorCopyWithImpl<$Res, _$GraphQLErrorImpl>
    implements _$$GraphQLErrorImplCopyWith<$Res> {
  __$$GraphQLErrorImplCopyWithImpl(
      _$GraphQLErrorImpl _value, $Res Function(_$GraphQLErrorImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? graphqlError = null,
  }) {
    return _then(_$GraphQLErrorImpl(
      null == graphqlError
          ? _value.graphqlError
          : graphqlError // ignore: cast_nullable_to_non_nullable
              as gql.GraphQLError,
    ));
  }
}

/// @nodoc

class _$GraphQLErrorImpl extends GraphQLError {
  const _$GraphQLErrorImpl(this.graphqlError) : super._();

  @override
  final gql.GraphQLError graphqlError;

  @override
  String toString() {
    return 'OperationError.graphql(graphqlError: $graphqlError)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$GraphQLErrorImpl &&
            (identical(other.graphqlError, graphqlError) ||
                other.graphqlError == graphqlError));
  }

  @override
  int get hashCode => Object.hash(runtimeType, graphqlError);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$GraphQLErrorImplCopyWith<_$GraphQLErrorImpl> get copyWith =>
      __$$GraphQLErrorImplCopyWithImpl<_$GraphQLErrorImpl>(this, _$identity);

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function(Exception exception) failure,
    required TResult Function(gql.GraphQLError graphqlError) graphql,
  }) {
    return graphql(graphqlError);
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function(Exception exception)? failure,
    TResult? Function(gql.GraphQLError graphqlError)? graphql,
  }) {
    return graphql?.call(graphqlError);
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function(Exception exception)? failure,
    TResult Function(gql.GraphQLError graphqlError)? graphql,
    required TResult orElse(),
  }) {
    if (graphql != null) {
      return graphql(graphqlError);
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(OperationFailure value) failure,
    required TResult Function(GraphQLError value) graphql,
  }) {
    return graphql(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(OperationFailure value)? failure,
    TResult? Function(GraphQLError value)? graphql,
  }) {
    return graphql?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(OperationFailure value)? failure,
    TResult Function(GraphQLError value)? graphql,
    required TResult orElse(),
  }) {
    if (graphql != null) {
      return graphql(this);
    }
    return orElse();
  }
}

abstract class GraphQLError extends OperationError {
  const factory GraphQLError(final gql.GraphQLError graphqlError) =
      _$GraphQLErrorImpl;
  const GraphQLError._() : super._();

  gql.GraphQLError get graphqlError;
  @JsonKey(ignore: true)
  _$$GraphQLErrorImplCopyWith<_$GraphQLErrorImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
