<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { graphql } from '$glitch';
  import { Button } from '$lib/components';
  import { MeLayout } from '$lib/layouts';

  $: query = graphql(`
    query MeCommentsPage_Query {
      ...MeLayout_query
    }
  `);
</script>

<Helmet title="댓글 관리" />

<MeLayout {$query}>
  <div class="bg-white sm:(space-y-8 border border-secondary rounded-2xl py-8)">
    <div class="flex items-center gap-2 subtitle-18-eb px-8 <sm:(p-4 bg-cardprimary)">
      <h2 class="<sm:hidden">댓글 관리</h2>
      <h2 class="sm:hidden">작성한 댓글</h2>
      <span class="text-gray-50">7</span>
    </div>

    <div class="<sm:(space-y-2 bg-surface-primary)">
      <div class="bg-white px-6 pt-4 pb-3 space-y-2">
        <span class="text-sm text-secondary">2023.08.25에 작성된 댓글</span>

        <div class="p-2 flex items-start gap-3 bg-primary rounded-xl">
          <div class="w-14 h-10.5 rounded-2 bg-black" />
          <div class="flex items-center body-15-b">
            새 청바지를 샀어요 1화
            <span class="i-lc-chevron-right" />
          </div>
        </div>
        <div class="bodylong-16-m">
          고행을 길을 예가 그들은 위하여 우리 목숨이 너의 그리하였는가?
          <br />
          <br />
          물방아 꾸며 않는 못할 인도하겠다는 동력은 관현악이며, 무엇이 심장의 것이다. 산야에 찾아 그들의 이 예가 따뜻한 맺어,
          있는 붙잡아 끓는다. 석가는 타오르고 천지는 용감하고 듣기만 길을 목숨이 고행을 교향악이다. 찾아 온갖 끝까지 노래하며
          실로 아니다.

          <Button class="text-blue-50 p-0! mt-1" size="md" variant="text">더보기</Button>
        </div>
        <div class="flex justify-end">
          <Button class="text-3.25 font-bold text-secondary" color="tertiary" size="sm" variant="outlined">
            <span class="i-px-reply-fill square-4 mr-2 text-icon-secondary" />
            3
          </Button>
        </div>
      </div>

      <div class="<sm:hidden px-6 py-4">
        <div class="w-full border-b border-alphagray-15" />
      </div>

      <div class="bg-white px-6 pt-4 pb-3 space-y-2">
        <span class="text-sm text-secondary">2023.08.25에 익명으로 작성된 댓글</span>

        <div class="p-2 flex items-start gap-3 bg-primary rounded-xl">
          <div class="w-14 h-10.5 rounded-2 bg-black" />

          <div class="flex items-center body-15-b">
            너는 어때
            <span class="i-lc-chevron-right" />
          </div>
        </div>
        <div class="bodylong-16-m">말도 안돼 ㅋㅋㅋㅋㅋ 재미없음</div>
        <div class="flex justify-end">
          <Button class="text-3.25 font-bold text-secondary" color="tertiary" size="sm" variant="outlined">
            <span class="i-px-reply-fill square-4 mr-2 text-icon-secondary" />
            0
          </Button>
        </div>
      </div>
    </div>
  </div>
</MeLayout>
