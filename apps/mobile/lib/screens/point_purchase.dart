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
import 'package:glyph/components/pressable.dart';
import 'package:glyph/context/loader.dart';
import 'package:glyph/extensions/int.dart';
import 'package:glyph/extensions/iterable.dart';
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
        return SingleChildScrollView(
          physics:
              const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    Row(
                      children: [
                        const Text(
                          '내 포인트',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const Gap(10),
                        Text(
                          '${data.me!.point.comma}P',
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w900,
                            color: BrandColors.brand_400,
                          ),
                        ),
                      ],
                    ),
                    const Gap(10),
                    const HorizontalDivider(color: BrandColors.gray_50),
                    const Gap(10),
                    Row(
                      children: [
                        const SizedBox(
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
                          '${data.me!.paidPoint.comma}P',
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
                        const SizedBox(
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
                          '${data.me!.freePoint.comma}P',
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
              ..._products.map((product) {
                return Pressable(
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 18,
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: Text(
                            product.title,
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                        Container(
                          width: 78,
                          padding: const EdgeInsets.symmetric(vertical: 6),
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
                      ],
                    ),
                  ),
                  onPressed: () async {
                    context.loader.show();

                    final client = ref.read(ferryProvider);
                    final req = GPurchasePointScreen_PurchasePoint_MutationReq(
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
              }).intersperse(
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 20),
                  child: HorizontalDivider(color: BrandColors.gray_50),
                ),
              ),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                color: const Color(0xFFFBFBFB),
                child: const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '결제 전 확인해주세요!',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: BrandColors.gray_600,
                      ),
                    ),
                    Gap(14),
                    Text(
                      '- 모든 금액은 부가가치세 제외 금액입니다. 결제 진행시 부가가치세 10%가 부과되어 결제됩니다.\n'
                      '- 충전한 포인트 전액 결제 취소는 포인트를 구매한 뒤 사용한 이력이 없고 결제 후 7일 이내에 결제 취소한 경우에 가능합니다.\n'
                      '- 포인트는 결제한 날로부터 5년이 되는 시점에 소멸됩니다. 단, 직접 회원 탈퇴해서 계정이 삭제되면 그 즉시 소멸되어 복구할 수 없습니다.\n'
                      '- 잔여 포인트는 충전한 포인트의 잔액이 80% 이하일 때에 한해 환불 신청이 가능하며, 잔액의 10% 또는 1,000원 중 큰 금액을 환급 수수료로 제외하고 환불해드립니다. 포인트 잔액이 1,000원 이하이면 환불이 불가능합니다. 환불은 글리프 도움 센터를 통해 신청할 수 있습니다.\n'
                      '- 무료로 지급받은 포인트는 환불받을 수 없으며, 지급일로부터 1년이 되는 시점에 소멸됩니다.\n'
                      '- 환불 페이지의 모든 양식을 기입하여 제출하면 즉시 잔여 포인트가 차감됩니다. 환불한 금액은 영업일 기준으로 5일 안에 환불 계좌로 입금해 드립니다.\n'
                      '- 미성년자는 포인트를 충전하기 전에 부모 등 법정 대리인의 동의를 받아야 합니다. 법정대리인이 동의하지 않으면 미성년자 본인 또는 법정대리인이 이용 계약을 취소할 수 있습니다.\n'
                      '- 자세한 내용은 서비스 이용 전 동의하신 이용약관을 참조해주시기 바랍니다.\n',
                      style: TextStyle(
                        fontSize: 12,
                        color: BrandColors.gray_500,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
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
