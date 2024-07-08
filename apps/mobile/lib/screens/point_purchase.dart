import 'dart:async';
import 'dart:io';

import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:auto_route/auto_route.dart';
import 'package:collection/collection.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:get_it/get_it.dart';
import 'package:glyph/components/horizontal_divider.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/context/bottom_sheet.dart';
import 'package:glyph/context/loader.dart';
import 'package:glyph/extensions/int.dart';
import 'package:glyph/extensions/iterable.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/point_purchase_screen_in_app_purchase_point_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/point_purchase_screen_purchase_point_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/point_purchase_screen_query.req.gql.dart';
import 'package:glyph/graphql/__generated__/schema.schema.gql.dart';
import 'package:glyph/icons/tabler.dart';
import 'package:glyph/providers/ferry.dart';
import 'package:glyph/themes/colors.dart';
import 'package:in_app_purchase/in_app_purchase.dart';
import 'package:mixpanel_flutter/mixpanel_flutter.dart';

@RoutePage()
class PointPurchaseScreen extends ConsumerStatefulWidget {
  const PointPurchaseScreen({super.key});

  @override
  createState() => _PointPurchaseScreenState();
}

class _PointPurchaseScreenState extends ConsumerState<PointPurchaseScreen> {
  final _mixpanel = GetIt.I<Mixpanel>();

  final _iap = GetIt.I<InAppPurchase>();
  final _products = <_Product>[];

  StreamSubscription<List<PurchaseDetails>>? _purchaseStreamSubscription;

  @override
  void initState() {
    super.initState();

    unawaited(_fetchProducts());

    _purchaseStreamSubscription = _iap.purchaseStream.listen((purchaseDetailsList) async {
      for (final purchaseDetails in purchaseDetailsList) {
        if (purchaseDetails.status == PurchaseStatus.pending) {
        } else {
          if (purchaseDetails.pendingCompletePurchase) {
            await _iap.completePurchase(purchaseDetails);
          }

          if (purchaseDetails.status == PurchaseStatus.purchased) {
            final client = ref.read(ferryProvider.notifier);

            _mixpanel.track('point:purchase', properties: {'productId': purchaseDetails.productID});

            final req = GPurchasePointScreen_InAppPurchasePoint_MutationReq(
              (b) => b
                ..vars.input.store = Platform.isIOS ? GStoreKind.APP_STORE : GStoreKind.PLAY_STORE
                ..vars.input.productId = purchaseDetails.productID
                ..vars.input.data = purchaseDetails.verificationData.serverVerificationData,
            );
            final resp = await client.request(req);
            await client.refetch(GPointPurchaseScreen_QueryReq());

            if (mounted) {
              context.loader.dismiss();
              await context.showBottomSheet(
                builder: (context) {
                  return _PurchaseCompleteBottomSheet(
                    pointAmount: resp.inAppPurchasePoint.pointAmount,
                  );
                },
              );
            }
          } else {
            if (mounted) {
              context.loader.dismiss();
            }
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
          physics: const AlwaysScrollableScrollPhysics(
            parent: BouncingScrollPhysics(),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const Pad(all: 20),
                child: Column(
                  children: [
                    Row(
                      children: [
                        const Text(
                          '내 포인트',
                          style: TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const Gap(10),
                        Text(
                          '${data.me!.point.comma}P',
                          style: const TextStyle(
                            fontSize: 17,
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
                        ConstrainedBox(
                          constraints: const BoxConstraints(
                            minWidth: 78,
                          ),
                          child: const Text(
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
                        ConstrainedBox(
                          constraints: const BoxConstraints(
                            minWidth: 78,
                          ),
                          child: const Text(
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
                  child: Padding(
                    padding: const Pad(horizontal: 20, vertical: 18),
                    child: Row(
                      children: [
                        Expanded(
                          child: Text(
                            product.name,
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                        Container(
                          width: 78,
                          height: 31,
                          decoration: BoxDecoration(
                            color: BrandColors.gray_900,
                            borderRadius: BorderRadius.circular(2),
                          ),
                          child: Center(
                            child: product.details == null
                                ? const SizedBox(
                                    width: 15,
                                    height: 15,
                                    child: CircularProgressIndicator(
                                      color: BrandColors.gray_0,
                                      strokeWidth: 1.5,
                                    ),
                                  )
                                : Text(
                                    product.details!.price,
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

                    final client = ref.read(ferryProvider.notifier);

                    _mixpanel.track(
                      'point:purchase',
                      properties: {
                        'paymentMethod': kReleaseMode ? GPaymentMethod.IN_APP_PURCHASE : GPaymentMethod.DUMMY,
                        'pointAmount': product.pointAmount,
                      },
                    );

                    final req = GPurchasePointScreen_PurchasePoint_MutationReq(
                      (b) => b
                        ..vars.input.paymentMethod =
                            kReleaseMode ? GPaymentMethod.IN_APP_PURCHASE : GPaymentMethod.DUMMY
                        ..vars.input.pointAmount = product.pointAmount
                        ..vars.input.pointAgreement = true,
                    );
                    final resp = await client.request(req);

                    if (kReleaseMode) {
                      await _iap.buyConsumable(
                        purchaseParam: PurchaseParam(
                          productDetails: product.details!,
                          applicationUserName: resp.purchasePoint.paymentData.asMap['uuid'],
                        ),
                      );
                    } else {
                      await client.refetch(GPointPurchaseScreen_QueryReq());

                      if (context.mounted) {
                        context.loader.dismiss();
                        await context.showBottomSheet(
                          builder: (context) {
                            return _PurchaseCompleteBottomSheet(
                              pointAmount: resp.purchasePoint.pointAmount,
                            );
                          },
                        );
                      }
                    }
                  },
                );
              }).intersperse(
                const Padding(
                  padding: Pad(horizontal: 20),
                  child: HorizontalDivider(color: BrandColors.gray_50),
                ),
              ),
              const Box(
                width: double.infinity,
                padding: Pad(all: 20),
                color: Color(0xFFFBFBFB),
                child: Column(
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
    final points = [1000, 3000, 5000, 10000, 30000, 50000, 100000];
    setState(() {
      _products.addAll(points.map((point) => _Product(name: '${point.comma}P', pointAmount: point)));
    });

    final resp = await _iap.queryProductDetails(points.map((point) => 'point_$point').toSet());
    if (mounted) {
      setState(() {
        for (final product in _products) {
          product.details = resp.productDetails.firstWhereOrNull((v) => v.id == 'point_${product.pointAmount}');
        }
      });
    }
  }
}

class _PurchaseCompleteBottomSheet extends StatelessWidget {
  const _PurchaseCompleteBottomSheet({
    required this.pointAmount,
  });

  final int pointAmount;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const Pad(horizontal: 20, top: 20),
      child: Column(
        children: [
          const Icon(Tabler.circle_check_filled, size: 38),
          const Gap(14),
          Text(
            '${pointAmount.comma}P 충전 완료',
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w800,
            ),
          ),
          const Gap(2),
          const Text(
            '충전이 완료되었어요\n글리프의 다양한 작품을 감상해보세요',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: BrandColors.gray_500,
            ),
          ),
          const Gap(40),
          Pressable(
            child: Container(
              width: double.infinity,
              height: 53,
              decoration: BoxDecoration(
                color: BrandColors.gray_900,
                borderRadius: BorderRadius.circular(6),
              ),
              child: const Center(
                child: Text(
                  '확인',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: BrandColors.gray_0,
                  ),
                ),
              ),
            ),
            onPressed: () async {
              await context.router.maybePop();
            },
          ),
        ],
      ),
    );
  }
}

class _Product {
  _Product({
    required this.name,
    required this.pointAmount,
  });

  final String name;
  final int pointAmount;
  ProductDetails? details;
}
