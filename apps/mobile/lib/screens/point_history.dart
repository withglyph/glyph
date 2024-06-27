import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/Img.dart';
import 'package:glyph/components/horizontal_divider.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/context/bottom_menu.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/point_history_screen_query.data.gql.dart';
import 'package:glyph/graphql/__generated__/point_history_screen_query.req.gql.dart';
import 'package:glyph/graphql/__generated__/schema.schema.gql.dart';
import 'package:glyph/icons/tabler.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/themes/colors.dart';
import 'package:jiffy/jiffy.dart';

@RoutePage()
class PointHistoryScreen extends ConsumerStatefulWidget {
  const PointHistoryScreen({super.key});

  @override
  createState() => _PointHistoryState();
}

class _PointHistoryState extends ConsumerState<PointHistoryScreen> {
  _PointFilter _selectedFeedType = _PointFilter.total;

  final _pointTransactionCause = {
    GPointTransactionCause.EXPIRE: '만료',
    GPointTransactionCause.INTERNAL: '시스템',
    GPointTransactionCause.PATRONIZE: '후원',
    GPointTransactionCause.PURCHASE: '충전',
    GPointTransactionCause.REFUND: '환불',
    GPointTransactionCause.UNDO_PURCHASE: '결제 취소',
    GPointTransactionCause.UNLOCK_CONTENT: '구매',
    GPointTransactionCause.EVENT_REWARD: '이벤트 보상',
  };

  final _pointPurchasePaymentMethod = {
    GPaymentMethod.CREDIT_CARD: '신용카드',
    GPaymentMethod.BANK_ACCOUNT: '계좌이체',
    GPaymentMethod.VIRTUAL_BANK_ACCOUNT: '가상계좌',
    GPaymentMethod.PHONE_BILL: '휴대폰결제',
    GPaymentMethod.GIFTCARD_CULTURELAND: '문화상품권',
    GPaymentMethod.GIFTCARD_SMARTCULTURE: '스마트문화상품권',
    GPaymentMethod.GIFTCARD_BOOKNLIFE: '도서문화상품권',
    GPaymentMethod.PAYPAL: '페이팔',
    GPaymentMethod.IN_APP_PURCHASE: '앱 내 구매',
    GPaymentMethod.DUMMY: '테스트 결제',
  };

  @override
  Widget build(BuildContext context) {
    return GraphQLOperation(
      operation: GPointHistoryScreen_QueryReq((b) => b
        ..vars.amountFilter = switch (_selectedFeedType) {
          _PointFilter.total => 0,
          _PointFilter.charge => -1,
          _PointFilter.usage => 1,
        }),
      builder: (context, client, data) {
        final points = data.me!.points;

        return Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 4),
              child: Pressable(
                child: Row(
                  children: [
                    Text(
                      switch (_selectedFeedType) {
                        _PointFilter.total => '전체',
                        _PointFilter.charge => '사용',
                        _PointFilter.usage => '충전'
                      },
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: BrandColors.gray_500,
                      ),
                    ),
                    const Gap(4),
                    const Icon(
                      Tabler.chevron_down,
                      size: 16,
                      color: BrandColors.gray_500,
                    ),
                  ],
                ),
                onPressed: () async {
                  await context.showBottomSelectMenu(
                    title: '필터',
                    value: _selectedFeedType,
                    items: [
                      BottomSelectMenuItem(
                        label: '전체',
                        value: _PointFilter.total,
                      ),
                      BottomSelectMenuItem(
                        label: '사용',
                        value: _PointFilter.charge,
                      ),
                      BottomSelectMenuItem(
                        label: '충전',
                        value: _PointFilter.usage,
                      ),
                    ],
                    onSelected: (value) {
                      setState(() {
                        _selectedFeedType = value;
                      });
                    },
                  );
                },
              ),
            ),
            Expanded(
              child: ListView.separated(
                itemBuilder: (context, index) {
                  final point = points[index];

                  return Pressable(
                    child: Container(
                      padding: const EdgeInsets.fromLTRB(20, 18, 20, 20),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  Jiffy.parse(point.createdAt.value).format(
                                    pattern: 'yyyy.MM.dd HH:mm 사용',
                                  ),
                                  style: const TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w500,
                                    color: BrandColors.gray_500,
                                  ),
                                ),
                                const Gap(4),
                                Text(
                                  point.maybeWhen(
                                    unlockContentPointTransaction:
                                        (transaction) =>
                                            transaction.post.publishedRevision
                                                ?.title ??
                                            '제목 없음',
                                    purchasePointTransaction: (transaction) =>
                                        '${_pointPurchasePaymentMethod[transaction.purchase.paymentMethod]}',
                                    orElse: () =>
                                        '${_pointTransactionCause[point.cause]}',
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w700,
                                    color: BrandColors.gray_500,
                                  ),
                                ),
                                const Gap(6),
                                Text(
                                  '${point.amount}P',
                                  style: TextStyle(
                                    fontWeight: FontWeight.w800,
                                    color: point.G__typename ==
                                            'UnlockContentPointTransaction'
                                        ? BrandColors.gray_900
                                        : BrandColors.brand_400,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          if (point.G__typename ==
                              'UnlockContentPointTransaction') ...[
                            const Gap(18),
                            // ignore: use_decorated_box
                            Container(
                              decoration: BoxDecoration(
                                border: Border.all(
                                  width: 0.8,
                                  color: BrandColors.gray_50,
                                ),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Img(
                                point.maybeWhen(
                                  unlockContentPointTransaction:
                                      (transaction) =>
                                          transaction.post.thumbnail,
                                  orElse: () => null,
                                ),
                                width: 78,
                                aspectRatio: 16 / 10,
                                borderRadius: 4,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                    onPressed: () async {
                      if (point.G__typename ==
                          'UnlockContentPointTransaction') {
                        await context.router.push(
                          PostRoute(
                            permalink: point.maybeWhen(
                              unlockContentPointTransaction: (transaction) =>
                                  transaction.post.permalink,
                              orElse: () => '',
                            ),
                          ),
                        );
                      }
                    },
                  );
                },
                separatorBuilder: (context, index) {
                  return const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 20),
                    child: HorizontalDivider(color: BrandColors.gray_50),
                  );
                },
                itemCount: points.length,
              ),
            ),
          ],
        );
      },
    );
  }
}

enum _PointFilter {
  total,
  charge,
  usage,
}
