<script lang="ts">
  import IconChevronRight from '~icons/tabler/chevron-right';
  import { graphql } from '$glitch';
  import { Button, Helmet, Icon } from '$lib/components';
  import { Checkbox } from '$lib/components/forms';
  import { comma } from '$lib/utils';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import ConfirmModal from './ConfirmModal.svelte';

  let agreeToDelete = false;
  let agreeToGiveUpFunds = false;
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

<Helmet description="글리프 계정을 탈퇴해요" title="계정 탈퇴" />

<div class={flex({ backgroundColor: 'gray.50', width: 'full' })}>
  <div
    class={flex({
      flexDirection: 'column',
      gap: '24px',
      marginX: 'auto',
      paddingY: '28px',
      paddingX: { base: '20px', sm: '40px' },
      width: 'full',
      maxWidth: '800px',
    })}
  >
    <h1 class={css({ fontSize: { base: '20px', sm: '24px' }, fontWeight: 'bold' })}>계정을 탈퇴하시겠어요?</h1>

    <div
      class={flex({
        backgroundColor: 'gray.0',
        borderWidth: '1px',
        borderColor: 'gray.200',
        paddingY: '32px',
        paddingX: { base: '24px', sm: '32px' },
        flexDirection: 'column',
        gap: '32px',
        fontSize: '14px',
      })}
    >
      <h2 class={css({ fontWeight: 'bold', fontSize: '18px' })}>탈퇴 시 삭제되는 정보들, 꼭 확인해주세요!</h2>

      <div>
        <h3 class={css({ marginBottom: '8px', fontWeight: 'bold', fontSize: '18px' })}>개인정보 데이터</h3>
        <p class={css({ color: 'gray.500' })}>
          탈퇴 후 가입한 계정 정보로 다시 로그인하실 수 없으며, 보유한 모든 데이터는 폐기됩니다.
        </p>
        <p class={css({ color: 'gray.500' })}>
          탈퇴 시 연동된 계정들의 정보 및 데이터 또한 영구적으로 삭제되기 때문에 다시 로그인하실 수 없습니다.
        </p>
      </div>

      <div>
        <a class={flex({ align: 'center', justify: 'space-between', marginBottom: '8px' })} href="/me/revenue">
          <h3 class={css({ fontWeight: 'bold', fontSize: '18px' })}>수익금 및 정산금</h3>
          <Icon style={css.raw({ color: 'gray.500' })} icon={IconChevronRight} size={24} />
        </a>
        <p class={css({ color: 'gray.500' })}>포인트 충전을 통해 적립한 포인트는 회원 탈퇴 시 환불이 불가능합니다.</p>
        <p class={css({ color: 'gray.500' })}>
          또한 환불 신청 후 환불 처리가 완료되기 전 탈퇴하는 경우 포인트 구매 기록을 확인할 수 없으므로 환불할 수
          없습니다.
        </p>
        <p class={css({ marginBottom: '6px', color: 'gray.500' })}>
          아직 정산하지 않았거나 자동 출금 신청하지 않은 수익 역시 회원 탈퇴 즉시 소멸되며 복구할 수 없습니다.
        </p>
        <span class={css({ color: 'red.400' })}>현재 남아있는 수익금 금액 : {comma($query.me.revenue)}원</span>
      </div>

      <div
        class={flex({
          align: 'center',
          wrap: 'wrap',
          gap: { base: '10px', sm: '20px' },
          paddingX: '14px',
          paddingY: '10px',
          backgroundColor: 'gray.50',
        })}
      >
        <label for="email">탈퇴 계정 이메일</label>
        <input name="email" class={css({ color: 'gray.600' })} readonly type="email" value={$query.me.email} />
      </div>
    </div>

    <div class={css({ width: 'fit' })}>
      <Checkbox style={css.raw({ marginBottom: '12px' })} bind:checked={agreeToDelete}>
        모든 데이터를 삭제하고 탈퇴하는 것에 동의해요
      </Checkbox>
      <Checkbox bind:checked={agreeToGiveUpFunds}>모든 충전금, 수익금을 포기하는 것에 동의해요</Checkbox>
    </div>

    <div>
      <Button
        style={css.raw({ width: 'full' })}
        disabled={!agreeToDelete || !agreeToGiveUpFunds}
        size="lg"
        on:click={() => (confirmModalOpen = true)}
      >
        글리프 탈퇴하기
      </Button>
      <Button
        style={css.raw({ marginTop: '12px', width: 'full', backgroundColor: 'gray.0' })}
        size="lg"
        variant="gray-outline"
      >
        탈퇴를 취소할래요
      </Button>
    </div>
  </div>
</div>

<ConfirmModal bind:open={confirmModalOpen} />
