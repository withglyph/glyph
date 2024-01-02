<script lang="ts">
  import dayjs from 'dayjs';
  import { graphql } from '$glitch';
  import { Button } from '$lib/components';
  // import { PopupSearch } from '$lib/components/forms';
  import { Table, TableData, TableHead, TableRow } from '$lib/components/table';
  import { comma } from '$lib/utils';

  $: query = graphql(`
    query RevenuePage_Query {
      auth(scope: USER)

      me @_required {
        id

        revenues {
          id
          amount
          createdAt

          post {
            id

            publishedRevision @_required {
              id
              title
            }

            space {
              id
              name
            }
          }
        }
      }
    }
  `);
</script>

{#if $query.me.revenues.length > 0}
  <div class="flex gap-2 justify-end">
    <!-- <PopupSearch /> -->
    <div class="flex gap-2 items-end">
      <Button href="/me/posts" size="md" type="link">내 포스트 관리하기</Button>
    </div>
  </div>
  <Table class="mt-4 text-left border-separate border-spacing-y-0.5">
    <TableRow>
      <TableHead class="w-50%">포스트명</TableHead>
      <TableHead class="w-30%">수익 발생일</TableHead>
      <TableHead class="text-right w-20%">수익금</TableHead>
    </TableRow>
    {#each $query.me.revenues as revenue (revenue.id)}
      <TableRow>
        <TableData>
          <div class="flex flex-col gap-1 truncate max-w-97">
            <div class="text-primary subtitle-16-b truncate sm:subtitle-18-b">
              {revenue.post?.publishedRevision?.title}
            </div>
            <div class="text-secondary body-13-m truncate">{revenue.post?.space.name}</div>
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
{:else}
  <div class="text-center body-16-m py-10 text-secondary">아직 수익 내역이 없어요</div>
{/if}

<!-- TODO: Pagination -->
