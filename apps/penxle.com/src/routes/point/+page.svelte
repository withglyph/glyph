<script lang="ts">
  import { graphql } from '$glitch';
  import { Button } from '$lib/components';
  import { DefaultLayout } from '$lib/layouts';
  import { comma } from '$lib/utils';

  $: query = graphql(`
    query PointPage_Query {
      ...DefaultLayout_query

      auth(scope: USER)

      me @_required {
        id
        point
      }
    }
  `);
</script>

<DefaultLayout {$query}>
  <div class="w-full max-w-300 flex flex-col sm:m-7.5">
    <h1 class="text-xl font-bold mb-5 <sm:hidden">포인트</h1>
    <div class="sm:(flex gap-10)">
      <aside class="w-81.5 bg-cardprimary border border-secondary rounded-2xl px-4 py-6 h-full <sm:hidden">
        <div class="bg-primary py-4 px-3 rounded-xl space-y-2">
          <p class="body-14-m text-secondary">보유 포인트</p>
          <p class="title-24-b">{comma($query.me.point)}P</p>
        </div>

        <Button class="mt-4" href="/point/purchase" size="xl" type="link">포인트 충전하기</Button>
      </aside>

      <div class="w-full max-w-208">
        <slot />
      </div>
    </div>
  </div>
</DefaultLayout>
