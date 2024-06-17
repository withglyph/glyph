import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/components/svg_icon.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/profile_screen_query.req.gql.dart';
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

class _ProfileScreenState extends State<ProfileScreen>
    with SingleTickerProviderStateMixin {
  final _focusNode = FocusNode();
  final _textController = TextEditingController();

  final _imagePicker = ImagePicker();

  late AnimationController _textFieldAnimationController;
  late Animation<Color?> _textFieldFillColorAnimation;

  ImageProvider? _avatarProvider;

  @override
  void initState() {
    super.initState();

    _textFieldAnimationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 150),
    );

    _textFieldFillColorAnimation = ColorTween(
      begin: BrandColors.gray_0,
      end: BrandColors.gray_50,
    ).animate(_textFieldAnimationController);

    _focusNode.addListener(() {
      if (_focusNode.hasFocus) {
        _textFieldAnimationController.forward();
      } else {
        _textFieldAnimationController.reverse();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return DefaultShell(
      title: '프로필 변경',
      child: GraphQLOperation(
        operation: GProfileScreen_QueryReq(),
        builder: (context, client, data) {
          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Column(
              children: [
                const Gap(20),
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
                              child: const SvgIcon(
                                'camera',
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
                const Row(
                  children: [
                    Text(
                      '이름',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    Gap(4),
                    Text(
                      '(최대 20자)',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: BrandColors.gray_400,
                      ),
                    ),
                  ],
                ),
                const Gap(6),
                AnimatedBuilder(
                  animation: _textFieldAnimationController,
                  builder: (context, child) {
                    return TextField(
                      controller: _textController,
                      focusNode: _focusNode,
                      textInputAction: TextInputAction.newline,
                      minLines: 1,
                      maxLines: 4,
                      decoration: InputDecoration(
                        isCollapsed: true,
                        filled: true,
                        fillColor: _textFieldFillColorAnimation.value,
                        enabledBorder: OutlineInputBorder(
                          borderSide: const BorderSide(
                            color: BrandColors.gray_100,
                          ),
                          borderRadius: BorderRadius.circular(2),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderSide: const BorderSide(
                            color: BrandColors.gray_100,
                          ),
                          borderRadius: BorderRadius.circular(2),
                        ),
                        disabledBorder: OutlineInputBorder(
                          borderSide: const BorderSide(
                            color: BrandColors.gray_100,
                          ),
                          borderRadius: BorderRadius.circular(2),
                        ),
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 8,
                        ),
                        hintText: '프로필명을 입력해주세요',
                        hintStyle: const TextStyle(
                          color: BrandColors.gray_400,
                        ),
                      ),
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                      ),
                      // onChanged: (value) {
                      //   setState(() {
                      //     _isEmpty = value.isEmpty;
                      //   });
                      // },
                      // onSubmitted: (value) {
                      //   _onSubmit();
                      // },
                    );
                  },
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
