// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'push_notification.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

/// @nodoc
mixin _$PushNotificationState {
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function(String token) granted,
    required TResult Function() unavailable,
  }) =>
      throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function(String token)? granted,
    TResult? Function()? unavailable,
  }) =>
      throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function(String token)? granted,
    TResult Function()? unavailable,
    required TResult orElse(),
  }) =>
      throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(Granted value) granted,
    required TResult Function(Unavailable value) unavailable,
  }) =>
      throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(Granted value)? granted,
    TResult? Function(Unavailable value)? unavailable,
  }) =>
      throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(Granted value)? granted,
    TResult Function(Unavailable value)? unavailable,
    required TResult orElse(),
  }) =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $PushNotificationStateCopyWith<$Res> {
  factory $PushNotificationStateCopyWith(PushNotificationState value,
          $Res Function(PushNotificationState) then) =
      _$PushNotificationStateCopyWithImpl<$Res, PushNotificationState>;
}

/// @nodoc
class _$PushNotificationStateCopyWithImpl<$Res,
        $Val extends PushNotificationState>
    implements $PushNotificationStateCopyWith<$Res> {
  _$PushNotificationStateCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;
}

/// @nodoc
abstract class _$$GrantedImplCopyWith<$Res> {
  factory _$$GrantedImplCopyWith(
          _$GrantedImpl value, $Res Function(_$GrantedImpl) then) =
      __$$GrantedImplCopyWithImpl<$Res>;
  @useResult
  $Res call({String token});
}

/// @nodoc
class __$$GrantedImplCopyWithImpl<$Res>
    extends _$PushNotificationStateCopyWithImpl<$Res, _$GrantedImpl>
    implements _$$GrantedImplCopyWith<$Res> {
  __$$GrantedImplCopyWithImpl(
      _$GrantedImpl _value, $Res Function(_$GrantedImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? token = null,
  }) {
    return _then(_$GrantedImpl(
      token: null == token
          ? _value.token
          : token // ignore: cast_nullable_to_non_nullable
              as String,
    ));
  }
}

/// @nodoc

class _$GrantedImpl extends Granted {
  const _$GrantedImpl({required this.token}) : super._();

  @override
  final String token;

  @override
  String toString() {
    return 'PushNotificationState.granted(token: $token)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$GrantedImpl &&
            (identical(other.token, token) || other.token == token));
  }

  @override
  int get hashCode => Object.hash(runtimeType, token);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$GrantedImplCopyWith<_$GrantedImpl> get copyWith =>
      __$$GrantedImplCopyWithImpl<_$GrantedImpl>(this, _$identity);

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function(String token) granted,
    required TResult Function() unavailable,
  }) {
    return granted(token);
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function(String token)? granted,
    TResult? Function()? unavailable,
  }) {
    return granted?.call(token);
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function(String token)? granted,
    TResult Function()? unavailable,
    required TResult orElse(),
  }) {
    if (granted != null) {
      return granted(token);
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(Granted value) granted,
    required TResult Function(Unavailable value) unavailable,
  }) {
    return granted(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(Granted value)? granted,
    TResult? Function(Unavailable value)? unavailable,
  }) {
    return granted?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(Granted value)? granted,
    TResult Function(Unavailable value)? unavailable,
    required TResult orElse(),
  }) {
    if (granted != null) {
      return granted(this);
    }
    return orElse();
  }
}

abstract class Granted extends PushNotificationState {
  const factory Granted({required final String token}) = _$GrantedImpl;
  const Granted._() : super._();

  String get token;
  @JsonKey(ignore: true)
  _$$GrantedImplCopyWith<_$GrantedImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class _$$UnavailableImplCopyWith<$Res> {
  factory _$$UnavailableImplCopyWith(
          _$UnavailableImpl value, $Res Function(_$UnavailableImpl) then) =
      __$$UnavailableImplCopyWithImpl<$Res>;
}

/// @nodoc
class __$$UnavailableImplCopyWithImpl<$Res>
    extends _$PushNotificationStateCopyWithImpl<$Res, _$UnavailableImpl>
    implements _$$UnavailableImplCopyWith<$Res> {
  __$$UnavailableImplCopyWithImpl(
      _$UnavailableImpl _value, $Res Function(_$UnavailableImpl) _then)
      : super(_value, _then);
}

/// @nodoc

class _$UnavailableImpl extends Unavailable {
  const _$UnavailableImpl() : super._();

  @override
  String toString() {
    return 'PushNotificationState.unavailable()';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType && other is _$UnavailableImpl);
  }

  @override
  int get hashCode => runtimeType.hashCode;

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function(String token) granted,
    required TResult Function() unavailable,
  }) {
    return unavailable();
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function(String token)? granted,
    TResult? Function()? unavailable,
  }) {
    return unavailable?.call();
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function(String token)? granted,
    TResult Function()? unavailable,
    required TResult orElse(),
  }) {
    if (unavailable != null) {
      return unavailable();
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(Granted value) granted,
    required TResult Function(Unavailable value) unavailable,
  }) {
    return unavailable(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(Granted value)? granted,
    TResult? Function(Unavailable value)? unavailable,
  }) {
    return unavailable?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(Granted value)? granted,
    TResult Function(Unavailable value)? unavailable,
    required TResult orElse(),
  }) {
    if (unavailable != null) {
      return unavailable(this);
    }
    return orElse();
  }
}

abstract class Unavailable extends PushNotificationState {
  const factory Unavailable() = _$UnavailableImpl;
  const Unavailable._() : super._();
}
