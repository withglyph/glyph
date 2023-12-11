<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import clsx from 'clsx';
  import { page } from '$app/stores';
  import { Button, Modal } from '$lib/components';
  import { Checkbox, Radio } from '$lib/components/forms';
  import { Menu, MenuItem } from '$lib/components/menu';

  let showTagOption = true;
  let showAdultOption = true;
  let showTriggerOption = true;
  let filterOpen = false;
</script>

<Helmet title="{$page.url.searchParams.get('q')} - 검색" />

<div class="grid max-w-300 <sm:(w-full bg-cardprimary py-5) sm:(grid-cols-[2fr_7fr] mx-10 gap-11.5 my-9.5)">
  <aside class="<sm:hidden">
    <div class="bg-cardprimary border border-secondary rounded-2xl px-3 py-4 sticky top-99px">
      <button
        class="w-full flex items-center justify-between py-3 gap-2.5"
        type="button"
        on:click={() => (showTagOption = !showTagOption)}
      >
        <p class="body-15-b w-full max-w-82.5">태그 옵션</p>
        <i class={clsx('i-lc-chevron-down square-4 color-icon-secondary', showTagOption && 'transform rotate-180')} />
      </button>

      {#if showTagOption}
        <div class="my-4">
          <p class="body-15-sb text-secondary mb-2">포함 태그</p>

          <form class="relative h-11.5 max-w-82.5 mb-3" on:submit|preventDefault>
            <input
              class="rounded-2.5 h-11.5 w-full py-2 pr-11 pl-4 border border-secondary body-14-m"
              type="text"
              on:input
            />
            <div class="absolute inset-y-0 right-3.5 flex center text-secondary h-100%">
              <i class="i-lc-search square-5 transition" aria-label="검색 아이콘" />
            </div>
          </form>

          <p class="body-15-sb text-secondary mb-2 mt-4">제외 태그</p>

          <form class="relative h-11.5 max-w-82.5 mt-3" on:submit|preventDefault>
            <input
              class="rounded-2.5 h-11.5 w-full py-2 pr-11 pl-4 border border-secondary body-14-m"
              type="text"
              on:input
            />
            <div class="absolute inset-y-0 right-3.5 flex center text-secondary h-100%">
              <i class="i-lc-search square-5 transition" aria-label="검색 아이콘" />
            </div>
          </form>
        </div>
      {/if}

      <hr class="w-full border-color-alphagray-10" />

      <button
        class="w-full flex items-center justify-between py-3 gap-2.5 mt-4"
        type="button"
        on:click={() => (showAdultOption = !showAdultOption)}
      >
        <p class="body-15-b w-full max-w-82.5">성인물 옵션</p>
        <i class={clsx('i-lc-chevron-down square-4 color-icon-secondary', showAdultOption && 'transform rotate-180')} />
      </button>

      {#if showAdultOption}
        <fieldset>
          <Radio class="gap-2 body-15-sb text-secondary mt-2">성인물 포함</Radio>
          <Radio class="gap-2 body-15-sb text-secondary mt-2">성인물 제외</Radio>
          <Radio class="gap-2 body-15-sb text-secondary mt-2">성인물만</Radio>
        </fieldset>
      {/if}

      <hr class="w-full border-color-alphagray-10 my-4" />

      <button
        class="w-full flex items-center justify-between py-3 gap-2.5"
        type="button"
        on:click={() => (showTriggerOption = !showTriggerOption)}
      >
        <p class="body-15-b w-full max-w-82.5">트리거 워닝</p>
        <i
          class={clsx('i-lc-chevron-down square-4 color-icon-secondary', showTriggerOption && 'transform rotate-180')}
        />
      </button>

      {#if showTriggerOption}
        <div class="flex flex-wrap gap-3">
          <Checkbox class="body-14-m">벌레/징그러움</Checkbox>
          <Checkbox class="body-14-m">폭력성</Checkbox>
          <Checkbox class="body-14-m">약물/범죄</Checkbox>
          <Checkbox class="body-14-m">잔인성</Checkbox>
          <Checkbox class="body-14-m">정신질환/공포증</Checkbox>
          <Checkbox class="body-14-m">사행성</Checkbox>
          <Checkbox class="body-14-m">PTSD/트라우마</Checkbox>
          <Checkbox class="body-14-m">공포성</Checkbox>
          <Checkbox class="body-14-m">부적절한 언어</Checkbox>
          <Checkbox class="body-14-m">기타</Checkbox>
        </div>
      {/if}
    </div>
  </aside>

  <div class="w-full sm:max-w-185">
    <div class="flex items-center justify-between w-full <sm:px-4">
      <h1 class="title-24-eb grow">'{$page.url.searchParams.get('q')}' 검색결과</h1>

      <Button class="sm:hidden" color="tertiary" size="md" variant="outlined" on:click={() => (filterOpen = true)}>
        <i class="i-lc-list-filter square-5" />
        필터
      </Button>

      <Menu class="<sm:hidden" placement="bottom">
        <Button slot="value" color="tertiary" size="md" variant="outlined">
          최신순
          <i class="i-lc-chevron-down square-5" />
        </Button>

        <MenuItem>최신순</MenuItem>
        <MenuItem>인기순</MenuItem>
      </Menu>
    </div>

    <slot />
  </div>
</div>

<Modal bind:open={filterOpen}>
  <div class="mt-8">
    <button
      class="w-full flex items-center justify-between py-3 gap-2.5"
      type="button"
      on:click={() => (showTagOption = !showTagOption)}
    >
      <p class="body-15-b w-full max-w-82.5">태그 옵션</p>
      <i class={clsx('i-lc-chevron-down square-4 color-icon-secondary', showTagOption && 'transform rotate-180')} />
    </button>

    {#if showTagOption}
      <div class="my-4">
        <p class="body-15-sb text-secondary mb-2">포함 태그</p>

        <form class="relative h-11.5 max-w-82.5 mb-3" on:submit|preventDefault>
          <input
            class="rounded-2.5 h-11.5 w-full py-2 pr-11 pl-4 border border-secondary body-14-m"
            type="text"
            on:input
          />
          <div class="absolute inset-y-0 right-3.5 flex center text-secondary h-100%">
            <i class="i-lc-search square-5 transition" aria-label="검색 아이콘" />
          </div>
        </form>

        <p class="body-15-sb text-secondary mb-2 mt-4">제외 태그</p>

        <form class="relative h-11.5 max-w-82.5 mt-3" on:submit|preventDefault>
          <input
            class="rounded-2.5 h-11.5 w-full py-2 pr-11 pl-4 border border-secondary body-14-m"
            type="text"
            on:input
          />
          <div class="absolute inset-y-0 right-3.5 flex center text-secondary h-100%">
            <i class="i-lc-search square-5 transition" aria-label="검색 아이콘" />
          </div>
        </form>
      </div>
    {/if}

    <hr class="w-full border-color-alphagray-10" />

    <button
      class="w-full flex items-center justify-between py-3 gap-2.5 mt-4"
      type="button"
      on:click={() => (showAdultOption = !showAdultOption)}
    >
      <p class="body-15-b w-full max-w-82.5">성인물 옵션</p>
      <i class={clsx('i-lc-chevron-down square-4 color-icon-secondary', showAdultOption && 'transform rotate-180')} />
    </button>

    {#if showAdultOption}
      <fieldset>
        <Radio class="gap-2 body-15-sb text-secondary mt-2">성인물 포함</Radio>
        <Radio class="gap-2 body-15-sb text-secondary mt-2">성인물 제외</Radio>
        <Radio class="gap-2 body-15-sb text-secondary mt-2">성인물만</Radio>
      </fieldset>
    {/if}

    <hr class="w-full border-color-alphagray-10 my-4" />

    <button
      class="w-full flex items-center justify-between py-3 gap-2.5"
      type="button"
      on:click={() => (showTriggerOption = !showTriggerOption)}
    >
      <p class="body-15-b w-full max-w-82.5">트리거 워닝</p>
      <i class={clsx('i-lc-chevron-down square-4 color-icon-secondary', showTriggerOption && 'transform rotate-180')} />
    </button>

    {#if showTriggerOption}
      <div class="flex flex-wrap gap-3">
        <Checkbox class="body-14-m">벌레/징그러움</Checkbox>
        <Checkbox class="body-14-m">폭력성</Checkbox>
        <Checkbox class="body-14-m">약물/범죄</Checkbox>
        <Checkbox class="body-14-m">잔인성</Checkbox>
        <Checkbox class="body-14-m">정신질환/공포증</Checkbox>
        <Checkbox class="body-14-m">사행성</Checkbox>
        <Checkbox class="body-14-m">PTSD/트라우마</Checkbox>
        <Checkbox class="body-14-m">공포성</Checkbox>
        <Checkbox class="body-14-m">부적절한 언어</Checkbox>
        <Checkbox class="body-14-m">기타</Checkbox>
      </div>
    {/if}
  </div>
</Modal>
