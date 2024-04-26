<script lang="ts">
  import dayjs from 'dayjs';
  import { graphql } from '$glitch';
  import { Helmet } from '$lib/components';
  import { comma } from '$lib/utils';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import type { PaymentMethod, PointTransactionCause } from '$glitch';

  $: query = graphql(`
    query MePointChargePage_Query {
      auth(scope: USER)

      me @_required {
        id

        points(amountFilter: 1) {
          __typename
          id
          amount
          cause
          createdAt

          ... on PurchasePointTransaction {
            purchase {
              id
              paymentMethod
            }
          }

          ... on EventRewardPointTransaction {
            eventEnrollment {
              id
              eventCode
            }
          }
        }
      }
    }
  `);

  const pointTransactionCause: Record<PointTransactionCause, string> = {
    EXPIRE: '만료',
    INTERNAL: '시스템',
    PATRONIZE: '후원',
    PURCHASE: '충전',
    REFUND: '환불',
    UNDO_PURCHASE: '결제 취소',
    UNLOCK_CONTENT: '구매',
    EVENT_REWARD: '이벤트 보상',
  };

  const pointPurchasePaymentMethod: Record<PaymentMethod, string> = {
    CREDIT_CARD: '신용카드',
    BANK_ACCOUNT: '계좌이체',
    VIRTUAL_BANK_ACCOUNT: '가상계좌',
    PHONE_BILL: '휴대폰결제',
    GIFTCARD_CULTURELAND: '문화상품권',
    GIFTCARD_SMARTCULTURE: '스마트문화상품권',
    GIFTCARD_BOOKNLIFE: '도서문화상품권',
    PAYPAL: '페이팔',
  };

  const eventName: Record<string, string> = {
    post_publish_202402: '포스트 업로드 이벤트 참여',
    twitter_spacelink_2024: 'SNS 연동 이벤트 참여',
  };
</script>

<Helmet description="포인트 충전 내역을 확인할 수 있어요" title="포인트 충전 내역" />

<ul class={flex({ direction: 'column', grow: '1' })}>
  {#each $query.me.points as point (point.id)}
    <li
      class={css({
        borderTopWidth: '1px',
        borderTopColor: 'gray.100',
        _firstOfType: { 'borderStyle': 'none', '& > div': { paddingTop: { base: '8px', sm: '20px' } } },
      })}
    >
      <div class={css({ paddingY: { base: '20px', sm: '32px' } })}>
        <time class={css({ fontSize: '12px', color: 'gray.400' })} datetime={point.createdAt}>
          {dayjs(point.createdAt).formatAsDateTime()}
        </time>
        <p class={css({ marginTop: '4px', fontSize: '15px', fontWeight: 'semibold', color: 'brand.400' })}>
          +{comma(point.amount)}P
        </p>
        <p class={css({ fontSize: '13px', fontWeight: 'medium', color: 'gray.600' })}>
          {#if point.__typename === 'PurchasePointTransaction'}
            {pointPurchasePaymentMethod[point.purchase.paymentMethod]}
          {:else if point.__typename === 'EventRewardPointTransaction'}
            {eventName[point.eventEnrollment.eventCode] ?? '이벤트 참여'}
          {:else}
            {pointTransactionCause[point.cause]}
          {/if}
        </p>
      </div>
    </li>
  {:else}
    <li class={css({ margin: 'auto', paddingY: '60px', fontSize: '14px', color: 'gray.500' })}>충전한 내역이 없어요</li>
  {/each}
</ul>
