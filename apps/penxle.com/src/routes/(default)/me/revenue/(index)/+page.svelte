<script lang="ts">
  import { Button } from '$lib/components';
  import { PopupSearch } from '$lib/components/forms';
  import { Table, TableData, TableHead, TableRow } from '$lib/components/table';
</script>

<div class="flex gap-2 justify-between">
  <PopupSearch />
  <div class="flex gap-2 items-end">
    <Button size="md">내 포스트 관리하기</Button>
  </div>
</div>

<Table class="mt-4 text-left border-separate border-spacing-y-0.125rem">
  <TableRow>
    <TableHead class="">포스트명</TableHead>
    <TableHead class="">수익 발생일</TableHead>
    <TableHead class="text-right pr-12!">수익금</TableHead>
  </TableRow>
  <TableRow>
    <TableData class="">
      <div class="flex flex-col gap-1">
        <div class="text-primary subtitle-18-b">뉴진스 해린 그려봤어요</div>
        <div class="text-secondary body-13-m">스페이스명</div>
      </div>
    </TableData>
    <TableData class="text-secondary body-14-m">23.08.22 13:00:00</TableData>
    <TableData class="text-right pr-12!">
      <div class="flex flex-col">
        <div class="text-primary subtitle-18-b">18,000원</div>
        <div class="text-secondary body-13-m">21,000원</div>
      </div>
    </TableData>
  </TableRow>
  <TableRow>
    <TableData class="">
      <div class="flex flex-col gap-1">
        <div class="text-primary subtitle-18-b">뉴진스 해린 그려봤어요</div>
        <div class="text-secondary body-13-m">스페이스명</div>
      </div>
    </TableData>
    <TableData class="text-secondary body-14-m">23.08.22 13:00:00</TableData>
    <TableData class="text-right pr-12!">
      <div class="flex flex-col">
        <div class="text-primary subtitle-18-b">18,000원</div>
        <div class="text-secondary body-13-m">21,000원</div>
      </div>
    </TableData>
  </TableRow>
</Table>

<!-- TODO: Pagination -->
