import 'package:auto_route/auto_route.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/shells/default.dart';

@RoutePage()
class OssLicensesScreen extends StatefulWidget {
  const OssLicensesScreen({super.key});

  @override
  createState() => _OssLicensesScreenState();
}

class _OssLicensesScreenState extends State<OssLicensesScreen> {
  final _licenses = LicenseRegistry.licenses.fold(
    <LicenseEntry>[],
    (prev, license) => prev..add(license),
  ).then((entries) {
    final licenses = <String, List<String>>{};

    for (final entry in entries) {
      for (final package in entry.packages) {
        licenses
            .putIfAbsent(package, () => [])
            .addAll(entry.paragraphs.map((v) => v.text));
      }
    }

    return licenses.entries.toList()..sort((a, b) => a.key.compareTo(b.key));
  });

  @override
  Widget build(BuildContext context) {
    return DefaultShell(
      title: '오픈소스 라이센스',
      child: FutureBuilder(
        future: _licenses,
        builder: (context, snapshot) {
          if (!snapshot.hasData) {
            return const Center(child: Text('가져오는 중...'));
          }

          return ListView.builder(
            itemCount: snapshot.requireData.length,
            itemBuilder: (context, index) {
              final entry = snapshot.requireData[index];

              return Pressable(
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 16,
                  ),
                  child: Text(
                    entry.key,
                    style: const TextStyle(
                      fontSize: 16,
                    ),
                  ),
                ),
                onPressed: () async {
                  await context.router.push(
                    OssLicensesDetailsRoute(
                      package: entry.key,
                      paragraphs: entry.value,
                    ),
                  );
                },
              );
            },
          );
        },
      ),
    );
  }
}
