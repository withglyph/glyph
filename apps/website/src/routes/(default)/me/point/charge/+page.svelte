<script lang="ts">
  import dayjs from 'dayjs';
  import { graphql } from '$glitch';
  import { Helmet } from '$lib/components';
  import { comma } from '$lib/utils';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import type { PointTransactionCause } from '$glitch';

  $: query = graphql(`
    query MePointChargePage_Query {
      auth(scope: USER)

      me @_required {
        id

        points(amountFilter: 1) {
          id
          amount
          cause
          createdAt
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
</script>

<Helmet description="포인트 충전 내역을 확인할 수 있어요" title="포인트 충전 내역" />

<ul class={flex({ direction: 'column', grow: '1' })}>
  {#each $query.me.points as point (point.id)}
    <li
      class={css({
        borderTopWidth: '1px',
        borderTopColor: 'gray.100',
        paddingY: '24px',
        _firstOfType: { borderStyle: 'none', smDown: { paddingTop: '8px' } },
      })}
    >
      <time class={css({ fontSize: '13px', color: 'gray.500' })} datetime={point.createdAt}>
        {dayjs(point.createdAt).formatAsDateTime()}
      </time>
      <p class={css({ marginTop: '4px', fontSize: '15px', fontWeight: 'semibold', color: 'brand.400' })}>
        +{comma(point.amount)}P
      </p>
      <p class={css({ fontSize: '13px', fontWeight: 'medium', color: 'gray.600' })}>
        {pointTransactionCause[point.cause]}
      </p>
    </li>
  {:else}
    <li class={css({ margin: 'auto', paddingY: '60px', fontSize: '14px', color: 'gray.500' })}>충전한 내역이 없어요</li>
  {/each}
</ul>
