<script lang="ts">
  import ReplyFill from '$assets/icons/reply-fill.svg?component';
  import { Button } from '$lib/components';
</script>

<div
  class="flex items-center gap-2 px-4 h-10 text-lg font-extrabold my-2 sm:my-4"
>
  <h3>작성한 댓글</h3>
  <span class="text-gray-50">7</span>
</div>

<div class="space-y-2 sm:space-y-6">
  <div class="bg-white p-6 space-y-2 sm:(border border-gray-30 rounded-2xl)">
    <span class="text-sm text-gray-50">2023.08.25에 작성된 댓글</span>

    <div class="p-2 flex gap-3 bg-gray-5 rounded-2xl">
      <div class="w-14 h-10.5 rounded-3.5 bg-black" />
      <div>
        새 청바지를 샀어요 1화
        <span class="i-lc-chevron-right" />
      </div>
    </div>
    <div class="text-3.75">
      고행을 길을 예가 그들은 위하여 우리 목숨이 너의 그리하였는가?
      <br />
      <br />
      물방아 꾸며 않는 못할 인도하겠다는 동력은 관현악이며, 무엇이 심장의 것이다.
      산야에 찾아 그들의 이 예가 따뜻한 맺어, 있는 붙잡아 끓는다. 석가는 타오르고
      천지는 용감하고 듣기만 길을 목숨이 고행을 교향악이다. 찾아 온갖 끝까지 노래하며
      실로 아니다.

      <Button class="text-blue-50 p-0 mt-1" size="md" variant="text">
        더보기
      </Button>
    </div>
    <div class="flex justify-end">
      <Button
        class="text-3.25 font-bold text-gray-50"
        color="tertiary"
        size="sm"
        variant="outlined"
      >
        <ReplyFill class="square-4 mr-2 fill-gray-40" />
        3
      </Button>
    </div>
  </div>

  <div class="bg-white p-6 space-y-2 sm:(border border-gray-30 rounded-2xl)">
    <span class="text-sm text-gray-50">2023.08.25에 익명으로 작성된 댓글</span>

    <div class="p-2 flex gap-3 bg-gray-5 rounded-2xl">
      <div class="w-14 h-10.5 rounded-3.5 bg-black" />
      <div>
        너는 어때
        <span class="i-lc-chevron-right" />
      </div>
    </div>
    <div class="text-3.75">말도 안돼 ㅋㅋㅋㅋㅋ 재미없음</div>
    <div class="flex justify-end">
      <Button
        class="text-3.25 font-bold text-gray-50"
        color="tertiary"
        size="sm"
        variant="outlined"
      >
        <ReplyFill class="square-4 mr-2 fill-gray-40" />
        0
      </Button>
    </div>
  </div>
</div>
