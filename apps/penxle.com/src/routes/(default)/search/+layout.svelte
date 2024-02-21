<script lang="ts">
  import clsx from 'clsx';
  import qs from 'query-string';
  import { page } from '$app/stores';
  import { Button, Modal, Tag } from '$lib/components';
  import { Checkbox, Radio } from '$lib/components/forms';
  import { Menu, MenuItem } from '$lib/components/menu';
  import { filterToLocaleString } from '$lib/const/feed';
  import { initSearchFilter } from './util';
  import type { ContentFilterCategory } from '$glitch';

  let showTagOption = true;
  let showAdultOption = true;
  let showTriggerOption = true;
  let filterOpen = false;
  let includeValue = '';
  let excludeValue = '';
  let { includeTags, excludeTags, adultFilter, excludeContentFilters, orderBy } = initSearchFilter($page.url.search);

  const contentFilters: ContentFilterCategory[] = [
    'GROSSNESS',
    'VIOLENCE',
    'CRIME',
    'CRUELTY',
    'PHOBIA',
    'GAMBLING',
    'TRAUMA',
    'HORROR',
    'INSULT',
    'OTHER',
  ];

  const updateSearchFilter = () => {
    const stringifiedURL = qs.stringifyUrl(
      {
        url: '/search/post',
        query: {
          q: $page.url.searchParams.get('q'),
          include_tags: includeTags,
          exclude_tags: excludeTags,
          adult: adultFilter,
          exclude_triggers: excludeContentFilters,
          order_by: orderBy,
          page: 1,
        },
      },
      {
        skipNull: false,
      },
    );

    location.href = stringifiedURL;
  };
</script>

<div class="max-w-300 grow <sm:(w-full bg-cardprimary pt-5) sm:(grid grid-cols-[2fr_7fr] mx-10 gap-11.5 my-9.5)">
  <aside class="min-w-38 max-w-61 <sm:hidden">
    <div class="bg-cardprimary border border-secondary rounded-2xl px-3 py-4">
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

          <form
            class="relative h-11.5 max-w-82.5 mb-3"
            on:submit|preventDefault={() => {
              const escapedValue = includeValue.trim().replaceAll(' ', '_');

              if (escapedValue.length === 0) return;

              includeValue = '';

              if (!includeTags.includes(escapedValue)) {
                includeTags = [...includeTags, escapedValue];
                updateSearchFilter();
              }
            }}
          >
            <input
              class="rounded-2.5 h-11.5 w-full py-2 pr-11 pl-4 border border-secondary body-14-m"
              type="text"
              bind:value={includeValue}
            />
            <button class="absolute inset-y-0 right-3.5 flex center text-secondary h-100%" type="submit">
              <i class="i-lc-search square-5 transition" aria-label="검색 아이콘" />
            </button>
          </form>

          <div class="flex flex-wrap gap-1.5">
            {#each includeTags as tag (tag)}
              <Tag
                class="w-fit cursor-pointer"
                as="label"
                size="sm"
                on:change={() => {
                  includeTags = includeTags.filter((t) => t !== tag);

                  updateSearchFilter();
                }}
              >
                #{tag}
              </Tag>
            {/each}
          </div>

          <p class="body-15-sb text-secondary mb-2 mt-4">제외 태그</p>

          <form
            class="relative h-11.5 max-w-82.5 mt-3"
            on:submit|preventDefault={() => {
              const escapedValue = excludeValue.trim().replaceAll(' ', '_');

              if (escapedValue.length === 0) return;

              if (!excludeTags.includes(escapedValue)) {
                excludeTags = [...excludeTags, escapedValue];
              }

              excludeValue = '';
              updateSearchFilter();
            }}
          >
            <input
              class="rounded-2.5 h-11.5 w-full py-2 pr-11 pl-4 border border-secondary body-14-m"
              type="text"
              bind:value={excludeValue}
            />
            <button class="absolute inset-y-0 right-3.5 flex center text-secondary h-100%" type="submit">
              <i class="i-lc-search square-5 transition" aria-label="검색 아이콘" />
            </button>
          </form>

          <div class="flex flex-wrap gap-1.5 mt-3">
            {#each excludeTags as tag (tag)}
              <Tag
                class="w-fit cursor-pointer"
                as="label"
                size="sm"
                on:change={() => {
                  excludeTags = excludeTags.filter((t) => t !== tag);
                  updateSearchFilter();
                }}
              >
                #{tag}
              </Tag>
            {/each}
          </div>
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
          <Radio
            class="gap-2 body-15-sb text-secondary mt-2"
            checked={adultFilter === null}
            on:change={() => {
              adultFilter = null;
              updateSearchFilter();
            }}
          >
            성인물 포함
          </Radio>
          <Radio
            class="gap-2 body-15-sb text-secondary mt-2"
            checked={adultFilter === false}
            on:change={() => {
              adultFilter = false;
              updateSearchFilter();
            }}
          >
            성인물 제외
          </Radio>
          <Radio
            class="gap-2 body-15-sb text-secondary mt-2"
            checked={adultFilter === true}
            on:change={() => {
              adultFilter = true;
              updateSearchFilter();
            }}
          >
            성인물만
          </Radio>
        </fieldset>
      {/if}

      <!-- <hr class="w-full border-color-alphagray-10 my-4" />

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
          {#each contentFilters as contentFilter (contentFilter)}
            <Checkbox
              class="body-14-m"
              checked={!excludeContentFilters.includes(contentFilter)}
              on:change={() => {
                excludeContentFilters = excludeContentFilters.includes(contentFilter)
                  ? excludeContentFilters.filter((f) => f !== contentFilter)
                  : [...excludeContentFilters, contentFilter];

                updateSearchFilter();
              }}
            >
              {filterToLocaleString[contentFilter]}
            </Checkbox>
          {/each}
        </div>
      {/if} -->
    </div>
  </aside>

  <div class="sm:max-w-185">
    <div class="flex items-center justify-between w-full <sm:px-4">
      <h1 class="title-24-eb grow">검색결과</h1>

      <Button
        class="sm:hidden mx-1 shrink-0"
        color="tertiary"
        size="md"
        variant="outlined"
        on:click={() => (filterOpen = true)}
      >
        <i class="i-lc-list-filter square-5" />
        필터
      </Button>

      <Menu as="div" placement="bottom">
        <Button slot="value" class="shrink-0" color="tertiary" size="md" variant="outlined">
          {orderBy === 'LATEST' ? '최신순' : '정확도순'}
          <i class="i-lc-chevron-down square-5" />
        </Button>

        <MenuItem
          on:click={() => {
            orderBy = 'LATEST';
            updateSearchFilter();
          }}
        >
          최신순
        </MenuItem>
        <MenuItem
          on:click={() => {
            orderBy = 'ACCURACY';
            updateSearchFilter();
          }}
        >
          정확도순
        </MenuItem>
      </Menu>
    </div>

    <slot />
  </div>
</div>

<Modal bind:open={filterOpen}>
  <svelte:fragment slot="title">검색 필터</svelte:fragment>

  <hr class="w-full border-color-alphagray-10 mb-2" />

  <div class="overflow-y-auto">
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

        <form
          class="relative h-11.5 max-w-82.5 mb-3"
          on:submit|preventDefault={() => {
            const escapedValue = includeValue.trim().replaceAll(' ', '_');

            if (escapedValue.length === 0) return;

            if (!includeTags.includes(escapedValue)) {
              includeTags = [...includeTags, escapedValue];
            }

            includeValue = '';
          }}
        >
          <input
            class="rounded-2.5 h-11.5 w-full py-2 pr-11 pl-4 border border-secondary body-14-m"
            type="text"
            bind:value={includeValue}
          />
          <div class="absolute inset-y-0 right-3.5 flex center text-secondary h-100%">
            <i class="i-lc-search square-5 transition" aria-label="검색 아이콘" />
          </div>
        </form>

        <div class="flex flex-wrap gap-1.5">
          {#each includeTags as tag (tag)}
            <Tag
              class="w-fit"
              as="label"
              size="sm"
              on:change={() => {
                includeTags = includeTags.filter((t) => t !== tag);
              }}
            >
              #{tag}
            </Tag>
          {/each}
        </div>

        <p class="body-15-sb text-secondary mb-2 mt-4">제외 태그</p>

        <form
          class="relative h-11.5 max-w-82.5 mt-3"
          on:submit|preventDefault={() => {
            const escapedValue = excludeValue.trim().replaceAll(' ', '_');

            if (escapedValue.length === 0) return;

            if (!excludeTags.includes(escapedValue)) {
              excludeTags = [...excludeTags, escapedValue];
            }

            excludeValue = '';
          }}
        >
          <input
            class="rounded-2.5 h-11.5 w-full py-2 pr-11 pl-4 border border-secondary body-14-m"
            type="text"
            bind:value={excludeValue}
          />
          <div class="absolute inset-y-0 right-3.5 flex center text-secondary h-100%">
            <i class="i-lc-search square-5 transition" aria-label="검색 아이콘" />
          </div>
        </form>

        <div class="flex flex-wrap gap-1.5 mt-3">
          {#each excludeTags as tag (tag)}
            <Tag
              class="w-fit"
              as="label"
              size="sm"
              on:change={() => {
                excludeTags = excludeTags.filter((t) => t !== tag);
              }}
            >
              #{tag}
            </Tag>
          {/each}
        </div>
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
        <Radio
          class="gap-2 body-15-sb text-secondary mt-2"
          checked={adultFilter === null}
          on:change={() => {
            adultFilter = null;
          }}
        >
          성인물 포함
        </Radio>
        <Radio
          class="gap-2 body-15-sb text-secondary mt-2"
          checked={adultFilter === false}
          on:change={() => {
            adultFilter = false;
          }}
        >
          성인물 제외
        </Radio>
        <Radio
          class="gap-2 body-15-sb text-secondary mt-2"
          checked={adultFilter === true}
          on:change={() => {
            adultFilter = true;
          }}
        >
          성인물만
        </Radio>
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
        {#each contentFilters as contentFilter (contentFilter)}
          <Checkbox
            class="body-14-m"
            checked={!excludeContentFilters.includes(contentFilter)}
            on:change={() => {
              excludeContentFilters = excludeContentFilters.includes(contentFilter)
                ? excludeContentFilters.filter((f) => f !== contentFilter)
                : [...excludeContentFilters, contentFilter];
            }}
          >
            {filterToLocaleString[contentFilter]}
          </Checkbox>
        {/each}
      </div>
    {/if}

    <div class="flex gap-3 mt-4">
      <Button
        class="grow"
        color="tertiary"
        size="xl"
        variant="outlined"
        on:click={() => {
          includeValue = '';
          excludeValue = '';
          includeTags = [];
          excludeTags = [];
          adultFilter = null;
          excludeContentFilters = [];
          orderBy = 'LATEST';
        }}
      >
        초기화
      </Button>
      <Button
        class="grow-3"
        size="xl"
        on:click={() => {
          filterOpen = false;
          updateSearchFilter();
        }}
      >
        결과보기
      </Button>
    </div>
  </div>
</Modal>
