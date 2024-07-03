import 'dart:typed_data';

import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:auto_route/auto_route.dart';
import 'package:built_value/json_object.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_form_builder/flutter_form_builder.dart';
import 'package:form_builder_validators/form_builder_validators.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/btn.dart';
import 'package:glyph/components/forms/form_text_field.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/context/toast.dart';
import 'package:glyph/ferry/extension.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/profile_screen_finalize_image_upload_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/profile_screen_prepare_image_upload_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/profile_screen_query.req.gql.dart';
import 'package:glyph/graphql/__generated__/profile_screen_update_user_profile_mutation.req.gql.dart';
import 'package:glyph/icons/tabler.dart';
import 'package:glyph/shells/default.dart';
import 'package:glyph/themes/colors.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:transparent_image/transparent_image.dart';

@RoutePage()
class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _formKey = GlobalKey<FormBuilderState>();
  final _imagePicker = ImagePicker();

  String? _avatarFilename;
  Uint8List? _avatarBytes;
  Rect? _avatarBounds;
  bool _isFormValid = true;

  @override
  Widget build(BuildContext context) {
    return DefaultShell(
      bottomBorder: false,
      useSafeArea: true,
      title: '프로필 변경',
      child: FormBuilder(
        key: _formKey,
        onChanged: () {
          setState(() {
            _isFormValid = _formKey.currentState!.validate();
          });
        },
        child: GraphQLOperation(
          operation: GProfileScreen_QueryReq(),
          builder: (context, client, data) {
            return Padding(
              padding: const Pad(horizontal: 20, vertical: 16),
              child: Column(
                children: [
                  Center(
                    child: Stack(
                      children: [
                        Pressable(
                          child: CircleAvatar(
                            radius: 50,
                            backgroundColor: BrandColors.gray_100,
                            child: Padding(
                              padding: const Pad(all: 1),
                              child: ClipOval(
                                child: FadeInImage(
                                  width: 98,
                                  height: 98,
                                  placeholder: MemoryImage(kTransparentImage),
                                  image: _avatarBytes == null
                                      ? CachedNetworkImageProvider(data.me!.profile.avatar.url)
                                      : MemoryImage(_avatarBytes!),
                                  fit: BoxFit.cover,
                                  fadeInDuration: const Duration(milliseconds: 150),
                                ),
                              ),
                            ),
                          ),
                          onPressed: () async {
                            if (!await Permission.photos.request().isGranted) {
                              await openAppSettings();
                              return;
                            }

                            final file = await _imagePicker.pickImage(
                              source: ImageSource.gallery,
                            );

                            if (file == null) {
                              return;
                            }

                            final bytes = await file.readAsBytes();
                            final image = await decodeImageFromList(bytes);
                            final imageSize = Size(image.width.toDouble(), image.height.toDouble());

                            setState(() {
                              _avatarFilename = file.name;
                              _avatarBytes = bytes;
                              _avatarBounds = Rect.fromCenter(
                                center: imageSize.center(Offset.zero),
                                width: imageSize.shortestSide,
                                height: imageSize.shortestSide,
                              );
                            });
                          },
                        ),
                        Positioned.fill(
                          child: IgnorePointer(
                            child: Center(
                              child: Container(
                                width: 32,
                                height: 32,
                                alignment: Alignment.center,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: BrandColors.gray_900.withOpacity(0.4),
                                ),
                                child: const Icon(
                                  Tabler.camera,
                                  size: 16,
                                  color: BrandColors.gray_0,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Gap(34),
                  FormTextField(
                    name: 'name',
                    labelText: '이름',
                    hintText: '프로필 이름을 입력해주세요',
                    initialValue: data.me!.profile.name,
                    validators: [
                      FormBuilderValidators.required(errorText: '프로필 이름을 입력해주세요'),
                      FormBuilderValidators.maxLength(20, errorText: '프로필 이름은 20글자를 넘을 수 없어요'),
                    ],
                  ),
                  const Spacer(),
                  Btn(
                    '변경',
                    size: BtnSize.large,
                    enabled: _isFormValid,
                    onPressed: () async {
                      if (!_formKey.currentState!.saveAndValidate()) {
                        return;
                      }

                      final values = _formKey.currentState!.value;

                      var avatarId = data.me!.profile.avatar.id;

                      if (_avatarBytes != null) {
                        final req1 = GProfileScreen_PrepareImageUpload_MutationReq();
                        final resp1 = await client.req(req1);

                        await http.put(Uri.parse(resp1.prepareImageUpload.presignedUrl), body: _avatarBytes);

                        final req2 = GProfileScreen_FinalizeImageUpload_MutationReq(
                          (b) => b
                            ..vars.input.key = resp1.prepareImageUpload.key
                            ..vars.input.name = _avatarFilename
                            ..vars.input.bounds = JsonObject({
                              'left': _avatarBounds!.left,
                              'top': _avatarBounds!.top,
                              'width': _avatarBounds!.width,
                              'height': _avatarBounds!.height,
                            }),
                        );
                        final resp2 = await client.req(req2);

                        avatarId = resp2.finalizeImageUpload.id;
                      }

                      final req = GProfileScreen_UpdateUserProfile_MutationReq(
                        (b) => b
                          ..vars.input.avatarId = avatarId
                          ..vars.input.name = values['name'],
                      );

                      await client.req(req);
                      if (context.mounted) {
                        context.toast.show('프로필이 변경되었어요');
                        await context.router.maybePop();
                      }
                    },
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}
