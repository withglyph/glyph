<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { Button } from '$lib/components';
  import { Checkbox } from '$lib/components/forms';
</script>

<Helmet title="계정 탈퇴" />

<div class="space-y-6">
  <h1 class="font-extrabold text-2xl">계정을 탈퇴하시겠어요?</h1>

  <div class="bg-white rounded-2xl border p-8 space-y-8 text-3.75">
    <h2 class="font-extrabold text-lg">
      탈퇴 시 삭제되는 정보들, 꼭 확인해주세요!
    </h2>

    <div>
      <h3 class="font-extrabold text-lg mb-2">개인정보 데이터</h3>
      <p>
        탈퇴 후 가입한 계정 정보로 다시 로그인하실 수 없으며, 보유한 모든
        데이터는 폐기돼요
      </p>
      <p>
        탈퇴 시 연동된 계정들의 정보 및 데이터 또한 영구적으로 삭제되기 때문에
        다시 로그인하실 수 없어요
      </p>
    </div>

    <div>
      <div class="flex items-center justify-between mb-2">
        <h3 class="font-extrabold text-lg">수익금 및 정산금</h3>
        <span class="i-lc-chevron-right" />
      </div>
      <p>
        포인트 충전을 통해 적립한 포인트는 회원 탈퇴 시 환불이 불가능합니다.
      </p>
      <p>
        또한 환불 신청 후 환불 처리가 완료되기 전 탈퇴하는 경우 포인트 구매
        기록을 확인할 수 없으므로 환불할 수 없어요
      </p>
      <p>
        아직 정산하지 않았거나 자동 출금 신청하지 않은 수익 역시 회원 탈퇴 즉시
        소멸되며 복구할 수 없어요
      </p>
      <span class="text-red-50">현재 남아있는 수익금 금액 : 30,000원</span>
    </div>

    <div>
      <div class="flex items-center justify-between mb-2">
        <h3 class="font-extrabold text-lg">팀스페이스 포스트 소유권</h3>
        <span class="i-lc-chevron-right" />
      </div>
      <p>
        팀 스페이스에서 작성한 게시물들은 삭제되지 않고, 팀 스페이스 소유자에게
        소유권이 이전됩니다.
      </p>
    </div>

    <div class="flex gap-5 bg-gray-5 rounded-2xl py-2.5 px-3.5 font-bold">
      <label for="email">탈퇴 계정 이메일</label>
      <input
        name="email"
        type="email"
        class="text-gray-50"
        value="kylie@penxle.io"
        disabled
      />
    </div>
  </div>

  <div>
    <Checkbox name="isAgreed" class="text-sm">
      모든 데이터를 삭제하고 탈퇴하는 것에 동의합니다
    </Checkbox>
    <Checkbox name="isAgreed" class="text-sm">
      모든 충전금, 수익금을 포기하는 것에 동의합니다.
    </Checkbox>
  </div>

  <div>
    <Button type="button" size="xl" class="w-full">
      모든 과정을 동의하고 탈퇴합니다
    </Button>
    <Button type="button" size="xl" color="tertiary" class="w-full mt-3">
      탈퇴를 취소할래요
    </Button>
  </div>
</div>
