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
import 'package:glyph/ferry/extension.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/point_purchase_screen_in_app_purchase_point_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/point_purchase_screen_purchase_point_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/point_purchase_screen_query.req.gql.dart';
import 'package:glyph/graphql/__generated__/schema.schema.gql.dart';
import 'package:glyph/providers/ferry.dart';
import 'package:glyph/shells/default.dart';
import 'package:in_app_purchase/in_app_purchase.dart';

@RoutePage()
class PointPurchaseScreen extends ConsumerStatefulWidget {
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

    this._fetchProducts();

    _purchaseStreamSubscription =
        _iap.purchaseStream.listen((purchaseDetailsList) {
      purchaseDetailsList.forEach(
        (purchaseDetails) async {
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
          }
        },
      );
    });
  }

  @override
  void dispose() {
    _purchaseStreamSubscription?.cancel();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return DefaultShell(
      title: '포인트',
      child: GraphQLOperation(
        operation: GPointPurchaseScreen_QueryReq(),
        builder: (context, client, data) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Gap(20),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 20),
                child: Text(
                  '현재 포인트',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Text(
                  '${data.me!.point} P',
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              const Gap(20),
              const HorizontalDivider(),
              const Gap(20),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 20),
                child: Text(
                  '포인트 구매',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              const Gap(8),
              Expanded(
                child: ListView.builder(
                  itemCount: _products.length,
                  itemBuilder: (context, index) {
                    final product = _products[index];
                    return ListTile(
                      title: Text(product.title),
                      trailing: Text(product.price),
                      contentPadding:
                          const EdgeInsets.symmetric(horizontal: 20),
                      onTap: () async {
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
                          client.requestController
                              .add(GPointPurchaseScreen_QueryReq());
                        }
                      },
                    );
                  },
                ),
              ),
            ],
          );
        },
      ),
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
