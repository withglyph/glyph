import 'dart:async';
import 'dart:io';

import 'package:auto_route/auto_route.dart';
import 'package:collection/collection.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:get_it/get_it.dart';
import 'package:glyph/ferry/extension.dart';
import 'package:glyph/graphql/__generated__/point_purchase_screen_finalize_in_app_purchase_point.req.gql.dart';
import 'package:glyph/graphql/__generated__/point_purchase_screen_in_app_purchase_point.req.gql.dart';
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
          print(purchaseDetails.status);
          if (purchaseDetails.status == PurchaseStatus.pending) {
          } else {
            if (purchaseDetails.status == PurchaseStatus.purchased) {
              final client = ref.read(ferryProvider);
              final req =
                  GPurchasePointScreen_FinalizeInAppPurchasePoint_MutationReq(
                (b) => b
                  ..vars.input.store = Platform.isIOS
                      ? GStoreKind.APP_STORE
                      : GStoreKind.PLAY_STORE
                  ..vars.input.productId = purchaseDetails.productID
                  ..vars.input.data =
                      purchaseDetails.verificationData.serverVerificationData,
              );
              await client.req(req);
            }

            if (purchaseDetails.pendingCompletePurchase) {
              await _iap.completePurchase(purchaseDetails);
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
      title: '포인트 구매',
      child: Column(
        children: _products
            .sorted((a, b) => a.rawPrice.compareTo(b.rawPrice))
            .map(
              (product) => ListTile(
                title: Text(product.title),
                subtitle: Text(product.description),
                trailing: Text(product.price),
                onTap: () async {
                  final client = ref.read(ferryProvider);
                  final req =
                      GPurchasePointScreen_InAppPurchasePoint_MutationReq(
                    (b) => b..vars.input.pointAmount = 1000,
                  );
                  final resp = await client.req(req);

                  await _iap.buyConsumable(
                    purchaseParam: PurchaseParam(
                      productDetails: product,
                      applicationUserName:
                          resp.inAppPurchasePoint.paymentData.asMap['uuid'],
                    ),
                  );
                },
              ),
            )
            .toList(),
      ),
    );
  }

  Future<void> _fetchProducts() async {
    final resp = await _iap.queryProductDetails({
      'point_1000',
      'point_3000',
      'point_5000',
    });

    setState(() {
      _products.addAll(resp.productDetails);
    });
  }
}
