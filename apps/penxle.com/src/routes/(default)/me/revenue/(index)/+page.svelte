<script lang="ts">
  import dayjs from 'dayjs';
  import qs from 'query-string';
  import { page } from '$app/stores';
  import { graphql } from '$glitch';
  import { Button, Helmet, Pagination } from '$lib/components';
  import { Table, TableData, TableHead, TableHeader, TableRow } from '$lib/components/table';
  import { comma } from '$lib/utils';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';

  $: query = graphql(`
    query MeRevenuePage_Query($page: Int! = 1, $take: Int! = 10) {
      auth(scope: USER)

      me @_required {
        id

        revenues(page: $page, take: $take) {
          id
          amount
          createdAt

          post {
            id

            publishedRevision @_required {
              id
              title
            }

            space @_required {
              id
              name
            }
          }
        }
      }
    }
  `);

  let initialPage = Number($page.url.searchParams.get('page')) || 1;

  const updatePage = () => {
    const stringifiedURL = qs.stringifyUrl({
      url: '/me/revenue',
      query: {
        page: initialPage,
      },
    });

    location.href = stringifiedURL;
  };
</script>

<Helmet description="내 수익을 확인하세요" title="수익" />

{#if $query.me.revenues.length > 0}
  <div class={flex({ justify: 'flex-end', gap: '8px' })}>
    <div class={flex({ align: 'flex-end', gap: '8px' })}>
      <Button href="/me/posts" size="md" type="link">내 포스트 관리하기</Button>
    </div>
  </div>

  <Table style={css.raw({ marginTop: '16px', textAlign: 'left', borderCollapse: 'separate', borderSpacingY: '2px' })}>
    <TableHeader>
      <TableRow>
        <TableHead style={css.raw({ width: '[50%]' })}>포스트명</TableHead>
        <TableHead style={css.raw({ width: '[30%]' })}>수익 발생일</TableHead>
        <TableHead style={css.raw({ textAlign: 'right', width: '[20%]' })}>수익금</TableHead>
      </TableRow>
    </TableHeader>
    {#each $query.me.revenues as revenue (revenue.id)}
      <TableRow>
        <TableData>
          <div class={flex({ direction: 'column', gap: '4px', maxWidth: '388px', truncate: true })}>
            <div class={css({ fontWeight: 'bold', truncate: true, sm: { fontSize: '18px' } })}>
              {revenue.post?.publishedRevision?.title ?? '(제목 없음)'}
            </div>
            <div class={css({ fontSize: '13px', fontWeight: 'medium', color: 'gray.500', truncate: true })}>
              {revenue.post?.space?.name}
            </div>
          </div>
        </TableData>
        <TableData style={css.raw({ fontSize: '14px', fontWeight: 'medium', color: 'gray.500' })}>
          {dayjs(revenue.createdAt).formatAsDateTime()}
        </TableData>
        <TableData style={css.raw({ textAlign: 'right' })}>
          <div class={flex({ direction: 'column' })}>
            <div class={css({ fontWeight: 'bold', sm: { fontSize: '18px' } })}>{comma(revenue.amount)}원</div>
          </div>
        </TableData>
      </TableRow>
    {/each}
  </Table>

  <Pagination {initialPage} onChange={updatePage} totalItems={$query.me.revenues.length} />
{:else}
  <div class={css({ paddingY: '40px', fontWeight: 'medium', textAlign: 'center', color: 'gray.500' })}>
    아직 수익 내역이 없어요
  </div>
{/if}
