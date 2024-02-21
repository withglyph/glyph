<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import dayjs from 'dayjs';
  import qs from 'query-string';
  import { page } from '$app/stores';
  import { graphql } from '$glitch';
  import { Button, Pagination } from '$lib/components';
  // import { PopupSearch } from '$lib/components/forms';
  import { Table, TableData, TableHead, TableHeader, TableRow } from '$lib/components/table';
  import { comma } from '$lib/utils';

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
  <div class="flex gap-2 justify-end">
    <!-- <PopupSearch /> -->
    <div class="flex gap-2 items-end">
      <Button href="/me/posts" size="md" type="link">내 포스트 관리하기</Button>
    </div>
  </div>
  <Table class="mt-4 text-left border-separate border-spacing-y-0.5">
    <TableHeader>
      <TableRow>
        <TableHead class="w-50%">포스트명</TableHead>
        <TableHead class="w-30%">수익 발생일</TableHead>
        <TableHead class="text-right w-20%">수익금</TableHead>
      </TableRow>
    </TableHeader>
    {#each $query.me.revenues as revenue (revenue.id)}
      <TableRow>
        <TableData>
          <div class="flex flex-col gap-1 truncate max-w-97">
            <div class="text-primary subtitle-16-b truncate sm:subtitle-18-b">
              {revenue.post?.publishedRevision?.title ?? '(제목 없음)'}
            </div>
            <div class="text-secondary body-13-m truncate">{revenue.post?.space?.name}</div>
          </div>
        </TableData>
        <TableData class="text-secondary body-14-m">{dayjs(revenue.createdAt).formatAsDateTime()}</TableData>
        <TableData class="text-right">
          <div class="flex flex-col">
            <div class="text-primary subtitle-16-b sm:subtitle-18-b">{comma(revenue.amount)}원</div>
          </div>
        </TableData>
      </TableRow>
    {/each}
  </Table>

  <Pagination {initialPage} onChange={updatePage} totalItems={$query.me.revenues.length} />
{:else}
  <div class="text-center body-16-m py-10 text-secondary">아직 수익 내역이 없어요</div>
{/if}
