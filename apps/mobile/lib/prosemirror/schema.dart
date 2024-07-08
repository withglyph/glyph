// This file is "main.dart"
import 'package:freezed_annotation/freezed_annotation.dart';

part 'schema.freezed.dart';
part 'schema.g.dart';

@freezed
class ProseMirrorNode with _$ProseMirrorNode {
  const factory ProseMirrorNode({
    required String type,
    Map<String, Object?>? attrs,
    List<ProseMirrorMark>? marks,
    List<ProseMirrorNode>? content,
    String? text,
  }) = _ProseMirrorNode;

  factory ProseMirrorNode.fromJson(Map<String, Object?> json) => _$ProseMirrorNodeFromJson(json);
}

@freezed
class ProseMirrorMark with _$ProseMirrorMark {
  const factory ProseMirrorMark({
    required String type,
    Map<String, Object?>? attrs,
  }) = _ProseMirrorMark;

  factory ProseMirrorMark.fromJson(Map<String, Object?> json) => _$ProseMirrorMarkFromJson(json);
}
