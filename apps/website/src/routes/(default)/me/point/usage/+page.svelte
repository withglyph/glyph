<script lang="ts">
  import dayjs from 'dayjs';
  import { graphql } from '$glitch';
  import { Helmet, Image } from '$lib/components';
  import { comma } from '$lib/utils';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import type { PointTransactionCause } from '$glitch';

  $: query = graphql(`
    query MePointUsagePage_Query {
      auth(scope: USER)

      me @_required {
        id

        points(amountFilter: -1) {
          __typename
          id
          amount
          cause
          createdAt

          ... on UnlockContentPointTransaction {
            post {
              id
              permalink

              thumbnail {
                id
                ...Image_image
              }

              space {
                id
                slug
                name

                icon {
                  id
                  ...Image_image
                }
              }

              publishedRevision {
                id
                title
                subtitle
              }
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
</script>

<Helmet description="포인트 사용 내역을 확인할 수 있어요" title="포인트 사용 내역" />

<ul class={flex({ direction: 'column', grow: '1' })}>
  {#each $query.me.points as point (point.id)}
    <li
      class={css({
        borderTopWidth: '1px',
        borderTopColor: 'gray.100',
        _firstOfType: { 'borderStyle': 'none', '& > a': { smDown: { paddingTop: '8px' } } },
      })}
    >
      {#if point.__typename === 'UnlockContentPointTransaction'}
        <a
          class={flex({
            align: 'flex-start',
            justify: 'space-between',
            gap: '14px',
            paddingY: { base: '20px', sm: '24px' },
          })}
          href="/{point.post?.space?.slug}/{point.post?.permalink}"
        >
          <div class={css({ truncate: true })}>
            <time class={css({ marginBottom: '4px', fontSize: '13px', color: 'gray.400' })} datetime={point.createdAt}>
              {dayjs(point.createdAt).formatAsDateTime()}
              {pointTransactionCause[point.cause]}
            </time>
            <h2 class={css({ fontSize: { base: '14px', sm: '15px' }, fontWeight: 'semibold', truncate: true })}>
              {point.post?.publishedRevision?.title ?? '(제목 없음)'}
            </h2>
            <p
              class={css({
                fontSize: '13px',
                fontWeight: { sm: 'medium' },
                color: 'gray.600',
                height: '19px',
                truncate: true,
              })}
            >
              {point.post?.publishedRevision?.subtitle ?? ''}
            </p>
            <p class={css({ marginTop: '4px', fontWeight: 'semibold' })}>
              -{comma(point.amount)}P
            </p>

            <div class={flex({ align: 'center', gap: '4px', marginTop: '6px', height: '24px' })}>
              <Image
                style={css.raw({ flex: 'none', size: '18px' })}
                $image={point.post?.space?.icon}
                placeholder
                size={24}
              />
              <p class={css({ fontSize: '12px', color: 'gray.600', truncate: true })}>
                {point.post?.space?.name ?? '스페이스'}
              </p>
            </div>
          </div>

          <Image
            style={css.raw({
              flex: 'none',
              width: { base: '100px', sm: '160px' },
              aspectRatio: '16/10',
              objectFit: 'cover',
            })}
            $image={point.post?.thumbnail}
            placeholder
            size={256}
          />
        </a>
      {:else}
        <div class={css({ paddingY: { base: '20px', sm: '32px' } })}>
          <time class={css({ fontSize: '13px', color: 'gray.400' })} datetime={point.createdAt}>
            {dayjs(point.createdAt).formatAsDateTime()}
          </time>
          <p class={css({ marginTop: '4px', fontSize: '15px', fontWeight: 'semibold', color: 'brand.400' })}>
            {comma(point.amount)}P
          </p>
          <p class={css({ fontSize: '13px', fontWeight: 'medium', color: 'gray.600' })}>
            {pointTransactionCause[point.cause]}
          </p>
        </div>
      {/if}
    </li>
  {:else}
    <li class={css({ margin: 'auto', paddingY: '60px', fontSize: '14px', color: 'gray.500' })}>사용 내역이 없어요</li>
  {/each}
</ul>
