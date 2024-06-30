import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:glyph/components/heading.dart';
import 'package:iamport_flutter/iamport_certification.dart';
import 'package:iamport_flutter/model/certification_data.dart';

@RoutePage()
class IdentificationIamportScreen extends StatelessWidget {
  const IdentificationIamportScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return IamportCertification(
      appBar: const Heading(),
      userCode: 'imp72534540',
      data: CertificationData(
        company: 'Glyph',
      ),
      callback: (result) async {
        await context.router.maybePop(result);
      },
    );
  }
}
