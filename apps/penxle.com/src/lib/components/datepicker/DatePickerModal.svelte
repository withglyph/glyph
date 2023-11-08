<script lang="ts">
  import dayjs from 'dayjs';
  import SveltyPicker, { config } from 'svelty-picker';
  import { Button, Modal } from '$lib/components';

  const ko = {
    days: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'],
    daysShort: ['일', '월', '화', '수', '목', '금', '토', '일'],
    daysMin: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    months: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    monthsShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    meridiem: ['오전', '오후'],
    suffix: ['', '', '', ''],
    todayBtn: '오늘',
    clearBtn: '지우기',
    okBtn: '조회하기',
    cancelBtn: '취소',
    timeView: '시계보기',
    backToDate: '달력보기',
  };
  config.i18n = ko;

  export let open = false;
  export let range: [string, string];
  export let onSubmit: (range: [string, string]) => void;
  export let okBtnText = '찾기';

  let value = range;
  $: startDate = value?.[0];
  $: endDate = value?.[1];

  function onReset() {
    value = range;
  }
</script>

<Modal class="overflow-visible!" size="md" bind:open>
  <svelte:fragment slot="title">필터</svelte:fragment>
  <svelte:fragment slot="subtitle">조회 기간</svelte:fragment>

  <div class="flex gap-2 [&>button]:(flex-1 body-15-b)" role="group">
    <Button class="truncate" color="tertiary" size="lg" variant="outlined">최대(1년)</Button>
    <Button color="tertiary" size="lg" variant="outlined">1개월</Button>
    <Button color="tertiary" size="lg" variant="outlined">3개월</Button>
    <Button color="tertiary" size="lg" variant="outlined">6개월</Button>
  </div>

  <SveltyPicker isPair={false} isRange bind:value>
    <div slot="inputs" class="relative" let:disabled let:displayValue let:onInputBlur let:onInputFocus>
      <Button class="w-full body-16-b m-t-xs" aria-hidden color="tertiary" {disabled} size="lg" variant="outlined">
        <div class="flex gap-1rem w-full">
          <div class="inline-flex flex-1 items-center gap-1rem justify-between">
            <span>{startDate && dayjs(startDate).formatAsDate()}</span>
            <i class="i-px-calender color-icon-secondary" />
          </div>
          <span>~</span>
          <div class="inline-flex flex-1 items-center gap-1rem justify-between">
            <span>{endDate && dayjs(endDate).formatAsDate()}</span>
            <i class="i-px-calender color-icon-secondary" />
          </div>
        </div>
      </Button>
      <input
        class="absolute inset-0 square-full cursor-pointer"
        aria-valuetext={displayValue}
        hidden
        readonly
        on:focus={onInputFocus}
        on:blur={onInputBlur}
      />
    </div>
    <header slot="header">
      <!-- FIX TODO: header slot 적용 안됨 -->
    </header>
    <svelte:fragment slot="action-row">
      <span />
    </svelte:fragment>
  </SveltyPicker>

  <svelte:fragment slot="action">
    <Button
      class="flex-1"
      size="xl"
      on:click={() => {
        onSubmit(value);
        open = false;
      }}
    >
      {okBtnText}
    </Button>
    <Button class="m-l-xs" color="tertiary" size="xl" variant="outlined" on:click={onReset}>초기화</Button>
  </svelte:fragment>
</Modal>

<style>
  :global(.std-calendar-wrap) {
    --sdt-bg-main: white;
    --sdt-shadow-color: rgba(0, 0, 0, 0.15);
    --sdt-radius: 16px;
    --sdt-color: #1c1917;
    --sdt-header-color: #1c1917;
    --sdt-bg-selected: #1c1917;
    --sdt-table-disabled-date: #a8a29e;
    --sdt-table-disabled-date-bg: var(--sdt-bg-main);
    --sdt-table-selected-bg: var(--sdt-bg-selected);
    --sdt-color-selected: #fff;
  }
</style>
