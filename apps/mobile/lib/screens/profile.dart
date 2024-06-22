import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_form_builder/flutter_form_builder.dart';
import 'package:form_builder_validators/form_builder_validators.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/button.dart';
import 'package:glyph/components/forms/form_text_field.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/profile_screen_query.req.gql.dart';
import 'package:glyph/icons/tabler.dart';
import 'package:glyph/shells/default.dart';
import 'package:glyph/themes/colors.dart';
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

  ImageProvider? _avatarProvider;
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
              padding: const EdgeInsets.all(20),
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
                              padding: const EdgeInsets.all(1),
                              child: ClipOval(
                                child: FadeInImage(
                                  width: 98,
                                  height: 98,
                                  placeholder: MemoryImage(kTransparentImage),
                                  image: _avatarProvider ??
                                      NetworkImage(data.me!.profile.avatar.url),
                                  fit: BoxFit.cover,
                                  fadeInDuration:
                                      const Duration(milliseconds: 150),
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

                            setState(() {
                              _avatarProvider = MemoryImage(bytes);
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
                      FormBuilderValidators.required(
                        errorText: '프로필 이름을 입력해주세요',
                      ),
                      FormBuilderValidators.maxLength(
                        20,
                        errorText: '프로필 이름은 20글자를 넘을 수 없어요',
                      ),
                    ],
                  ),
                  const Spacer(),
                  Button(
                    '변경',
                    enabled: _isFormValid,
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
