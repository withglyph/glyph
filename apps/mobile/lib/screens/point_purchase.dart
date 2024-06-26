import 'dart:async';
import 'dart:io';

import 'package:auto_route/auto_route.dart';
import 'package:collection/collection.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:get_it/get_it.dart';
import 'package:glyph/components/horizontal_divider.dart';
import 'package:glyph/context/loader.dart';
import 'package:glyph/ferry/extension.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/point_purchase_screen_in_app_purchase_point_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/point_purchase_screen_purchase_point_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/point_purchase_screen_query.req.gql.dart';
import 'package:glyph/graphql/__generated__/schema.schema.gql.dart';
import 'package:glyph/providers/ferry.dart';
import 'package:glyph/themes/colors.dart';
import 'package:in_app_purchase/in_app_purchase.dart';

@RoutePage()
class PointPurchaseScreen extends ConsumerStatefulWidget {
  const PointPurchaseScreen({super.key});

  @override
  createState() => _PointPurchaseScreenState();
}

class _PointPurchaseScreenState extends ConsumerState<PointPurchaseScreen> {
  final _iap = GetIt.I<InAppPurchase>();
  final _products = <ProductDetails>[];

  StreamSubscription<List<PurchaseDetails>>? _purchaseStreamSubscription;

  @override
  void initState() {
    super.initState();

    unawaited(_fetchProducts());

    _purchaseStreamSubscription =
        _iap.purchaseStream.listen((purchaseDetailsList) async {
      for (final purchaseDetails in purchaseDetailsList) {
        if (purchaseDetails.status == PurchaseStatus.pending) {
        } else {
          if (purchaseDetails.pendingCompletePurchase) {
            await _iap.completePurchase(purchaseDetails);
          }

          if (purchaseDetails.status == PurchaseStatus.purchased) {
            final client = ref.read(ferryProvider);
            final req = GPurchasePointScreen_InAppPurchasePoint_MutationReq(
              (b) => b
                ..vars.input.store = Platform.isIOS
                    ? GStoreKind.APP_STORE
                    : GStoreKind.PLAY_STORE
                ..vars.input.productId = purchaseDetails.productID
                ..vars.input.data =
                    purchaseDetails.verificationData.serverVerificationData,
            );
            await client.req(req);
            client.requestController.add(GPointPurchaseScreen_QueryReq());
          }

          if (mounted) {
            context.loader.dismiss();
          }
        }
      }
    });
  }

  @override
  void dispose() {
    unawaited(_purchaseStreamSubscription?.cancel());

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GraphQLOperation(
      operation: GPointPurchaseScreen_QueryReq(),
      builder: (context, client, data) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: EdgeInsets.all(20),
              child: Column(
                children: [
                  Row(
                    children: [
                      Text(
                        '내 포인트',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const Gap(10),
                      Text(
                        '${data.me!.point}P',
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w900,
                          color: BrandColors.brand_400,
                        ),
                      ),
                    ],
                  ),
                  const Gap(10),
                  HorizontalDivider(color: BrandColors.gray_50),
                  const Gap(10),
                  Row(
                    children: [
                      Container(
                        width: 78,
                        child: Text(
                          '충전한 포인트',
                          style: TextStyle(
                            fontSize: 13,
                            color: BrandColors.gray_600,
                          ),
                        ),
                      ),
                      const Gap(10),
                      Text(
                        '${data.me!.paidPoint}P',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: BrandColors.gray_600,
                        ),
                      ),
                    ],
                  ),
                  const Gap(4),
                  Row(
                    children: [
                      Container(
                        width: 78,
                        child: Text(
                          '무료 포인트',
                          style: TextStyle(
                            fontSize: 13,
                            color: BrandColors.gray_600,
                          ),
                        ),
                      ),
                      const Gap(10),
                      Text(
                        '${data.me!.freePoint}P',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: BrandColors.gray_600,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const HorizontalDivider(
              height: 6,
              color: BrandColors.gray_50,
            ),
            Expanded(
              child: ListView.separated(
                shrinkWrap: true,
                itemCount: _products.length,
                itemBuilder: (context, index) {
                  final product = _products[index];

                  return ListTile(
                    title: Text(
                      product.title,
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    trailing: Container(
                      width: 78,
                      height: 29,
                      decoration: BoxDecoration(
                        color: BrandColors.brand_400,
                        borderRadius: BorderRadius.circular(2),
                      ),
                      child: Center(
                        child: Text(
                          product.price,
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: BrandColors.gray_0,
                          ),
                        ),
                      ),
                    ),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 20),
                    onTap: () async {
                      context.loader.show();

                      final client = ref.read(ferryProvider);
                      final req =
                          GPurchasePointScreen_PurchasePoint_MutationReq(
                        (b) => b
                          ..vars.input.paymentMethod = kReleaseMode
                              ? GPaymentMethod.IN_APP_PURCHASE
                              : GPaymentMethod.DUMMY
                          ..vars.input.pointAmount = int.parse(
                            product.id.split('_').last,
                          )
                          ..vars.input.pointAgreement = true,
                      );
                      final resp = await client.req(req);

                      if (kReleaseMode) {
                        await _iap.buyConsumable(
                          purchaseParam: PurchaseParam(
                            productDetails: product,
                            applicationUserName:
                                resp.purchasePoint.paymentData.asMap['uuid'],
                          ),
                        );
                      } else {
                        if (context.mounted) {
                          context.loader.dismiss();
                        }

                        client.requestController
                            .add(GPointPurchaseScreen_QueryReq());
                      }
                    },
                  );
                },
                separatorBuilder: (context, index) {
                  return const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 20),
                    child: HorizontalDivider(
                      color: BrandColors.gray_50,
                    ),
                  );
                },
              ),
            ),
          ],
        );
      },
    );
  }

  Future<void> _fetchProducts() async {
    final resp = await _iap.queryProductDetails({
      'point_1000',
      'point_3000',
      'point_5000',
      'point_10000',
      'point_30000',
      'point_50000',
      'point_100000',
    });

    setState(() {
      _products.addAll(
        resp.productDetails.sorted((a, b) => a.rawPrice.compareTo(b.rawPrice)),
      );
    });
  }
}
