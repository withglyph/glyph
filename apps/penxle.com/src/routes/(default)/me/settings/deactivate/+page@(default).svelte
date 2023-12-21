<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { graphql } from '$glitch';
  import { Button } from '$lib/components';
  import { Checkbox } from '$lib/components/forms';
  import { comma } from '$lib/utils';
  import ConfirmModal from './ConfirmModal.svelte';

  let confirmModalOpen = false;

  $: query = graphql(`
    query MeSettingsDeactivatePage_Query {
      auth(scope: USER)

      me @_required {
        id
        email
        revenue
      }
    }
  `);
</script>

<Helmet title="계정 탈퇴" />
<div class="mx-auto py-7 px-5 sm:px-10">
  <div class="space-y-6 w-full max-w-200">
    <h1 class="font-extrabold text-2xl">계정을 탈퇴하시겠어요?</h1>

    <div class="bg-white rounded-2xl border border-gray-30 py-8 px-6 sm:px-8 space-y-8 text-3.75">
      <h2 class="font-extrabold text-lg">탈퇴 시 삭제되는 정보들, 꼭 확인해주세요!</h2>

      <div>
        <h3 class="font-extrabold text-lg mb-2">개인정보 데이터</h3>
        <p class="text-secondary">
          탈퇴 후 가입한 계정 정보로 다시 로그인하실 수 없으며, 보유한 모든 데이터는 폐기돼요
        </p>
        <p class="text-secondary">
          탈퇴 시 연동된 계정들의 정보 및 데이터 또한 영구적으로 삭제되기 때문에 다시 로그인하실 수 없어요
        </p>
      </div>

      <div>
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-extrabold text-lg">수익금 및 정산금</h3>
          <i class="i-lc-chevron-right text-secondary square-6" />
        </div>
        <p class="text-secondary">포인트 충전을 통해 적립한 포인트는 회원 탈퇴 시 환불이 불가능해요.</p>
        <p class="text-secondary">
          또한 환불 신청 후 환불 처리가 완료되기 전 탈퇴하는 경우 포인트 구매 기록을 확인할 수 없으므로 환불할 수 없어요
        </p>
        <p class="text-secondary">
          아직 정산하지 않았거나 자동 출금 신청하지 않은 수익 역시 회원 탈퇴 즉시 소멸되며 복구할 수 없어요
        </p>
        <span class="text-red-50">현재 남아있는 수익금 금액 : {comma($query.me.revenue)}원</span>
      </div>

      <div>
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-extrabold text-lg">팀스페이스 포스트 소유권</h3>
          <i class="i-lc-chevron-right text-secondary square-6" />
        </div>
        <p class="text-secondary">
          팀 스페이스에서 작성한 게시물들은 삭제되지 않고, 팀 스페이스 소유자에게 소유권이 이전되어요.
        </p>
      </div>

      <div class="flex items-center flex-wrap gap-2.5 sm:gap-5 bg-primary rounded-2xl py-2.5 px-3.5 font-bold">
        <label for="email">탈퇴 계정 이메일</label>
        <input name="email" class="text-secondary" disabled type="email" value={$query.me.email} />
      </div>
    </div>

    <div>
      <Checkbox class="text-sm mb-3">모든 데이터를 삭제하고 탈퇴하는 것에 동의해요</Checkbox>
      <Checkbox class="text-sm">모든 충전금, 수익금을 포기하는 것에 동의해요</Checkbox>
    </div>

    <div>
      <Button class="w-full" size="xl" on:click={() => (confirmModalOpen = true)}>펜슬 탈퇴하기</Button>
      <Button class="w-full mt-3" color="secondary" size="xl">탈퇴를 취소할래요</Button>
    </div>
  </div>
</div>

<ConfirmModal bind:open={confirmModalOpen} />
