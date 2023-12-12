<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import clsx from 'clsx';
  import qs from 'query-string';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { Button, Modal, Tag } from '$lib/components';
  import { Checkbox, Radio } from '$lib/components/forms';
  import { Menu, MenuItem } from '$lib/components/menu';
  import type { ContentFilterCategory, OrderByKind } from '$glitch';

  let showTagOption = true;
  let showAdultOption = true;
  let showTriggerOption = true;
  let filterOpen = false;

  let includeTags: string[] = [];
  let excludeTags: string[] = [];
  let includeValue = '';
  let excludeValue = '';
  let adultFilter: boolean | null = null;
  let excludeContentFilters: ContentFilterCategory[] = [];
  let orderBy: OrderByKind = 'LATEST';

  $: orderByText = orderBy === 'LATEST' ? '최신순' : '정확도순';

  $: if (qs.parseUrl($page.url.search)?.query) {
    const parsedURL = qs.parseUrl($page.url.search).query;

    if (parsedURL.include_tags) {
      if (typeof parsedURL.include_tags === 'string') {
        includeTags = [parsedURL.include_tags];
      } else if (typeof parsedURL.include_tags === 'object') {
        includeTags = parsedURL.include_tags as string[];
      }
    }

    if (parsedURL.exclude_tags) {
      if (typeof parsedURL.exclude_tags === 'string') {
        excludeTags = [parsedURL.exclude_tags];
      } else if (typeof parsedURL.exclude_tags === 'object') {
        excludeTags = parsedURL.exclude_tags as string[];
      }
    }

    adultFilter = parsedURL.adult ? JSON.parse(parsedURL.adult.toString()) : null;

    if (parsedURL.exclude_triggers) {
      if (typeof parsedURL.exclude_triggers === 'string') {
        excludeContentFilters = [parsedURL.exclude_triggers] as ContentFilterCategory[];
      } else if (typeof parsedURL.exclude_triggers === 'object') {
        excludeContentFilters = parsedURL.exclude_triggers as ContentFilterCategory[];
      }
    }

    orderBy = parsedURL.order_by === 'LATEST' ? 'LATEST' : 'ACCURACY';
  }

  const addSearchOption = async () => {
    const url = qs.stringifyUrl(
      {
        url: '/search/post',
        query: {
          q: $page.url.searchParams.get('q'),
          include_tags: includeTags,
          exclude_tags: excludeTags,
          adult: adultFilter,
          exclude_triggers: excludeContentFilters,
          order_by: orderBy,
        },
      },
      {
        skipNull: false,
      },
    );
    await goto(url);
  };
</script>

<Helmet title="{$page.url.searchParams.get('q')} - 검색" />

<div class="grid max-w-300 <sm:(w-full bg-cardprimary py-5) sm:(grid-cols-[2fr_7fr] mx-10 gap-11.5 my-9.5)">
  <aside class="<sm:hidden">
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

              if (!includeTags.includes(escapedValue)) {
                includeTags = [...includeTags, escapedValue];
              }

              includeValue = '';
              addSearchOption();
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
                class="w-fit"
                as="label"
                size="sm"
                on:change={() => {
                  includeTags = includeTags.filter((t) => t !== tag);
                  addSearchOption();
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
              addSearchOption();
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
                class="w-fit"
                as="label"
                size="sm"
                on:change={() => {
                  excludeTags = excludeTags.filter((t) => t !== tag);
                  addSearchOption();
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
              addSearchOption();
            }}
          >
            성인물 포함
          </Radio>
          <Radio
            class="gap-2 body-15-sb text-secondary mt-2"
            checked={adultFilter === false}
            on:change={() => {
              adultFilter = false;
              addSearchOption();
            }}
          >
            성인물 제외
          </Radio>
          <Radio
            class="gap-2 body-15-sb text-secondary mt-2"
            checked={adultFilter === true}
            on:change={() => {
              adultFilter = true;
              addSearchOption();
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
        <i
          class={clsx('i-lc-chevron-down square-4 color-icon-secondary', showTriggerOption && 'transform rotate-180')}
        />
      </button>

      {#if showTriggerOption}
        <div class="flex flex-wrap gap-3">
          <Checkbox
            class="body-14-m"
            checked={!excludeContentFilters?.includes('GROSSNESS')}
            on:change={() => {
              excludeContentFilters = excludeContentFilters?.includes('GROSSNESS')
                ? excludeContentFilters.filter((f) => f !== 'GROSSNESS')
                : [...excludeContentFilters, 'GROSSNESS'];
              addSearchOption();
            }}
          >
            벌레/징그러움
          </Checkbox>
          <Checkbox
            class="body-14-m"
            checked={!excludeContentFilters?.includes('VIOLENCE')}
            on:change={() => {
              excludeContentFilters = excludeContentFilters?.includes('VIOLENCE')
                ? excludeContentFilters.filter((f) => f !== 'VIOLENCE')
                : [...excludeContentFilters, 'VIOLENCE'];
              addSearchOption();
            }}
          >
            폭력성
          </Checkbox>
          <Checkbox
            class="body-14-m"
            checked={!excludeContentFilters?.includes('CRIME')}
            on:change={() => {
              excludeContentFilters = excludeContentFilters?.includes('CRIME')
                ? excludeContentFilters.filter((f) => f !== 'CRIME')
                : [...excludeContentFilters, 'CRIME'];
              addSearchOption();
            }}
          >
            약물/범죄
          </Checkbox>
          <Checkbox
            class="body-14-m"
            checked={!excludeContentFilters?.includes('CRUELTY')}
            on:change={() => {
              excludeContentFilters = excludeContentFilters?.includes('CRUELTY')
                ? excludeContentFilters.filter((f) => f !== 'CRUELTY')
                : [...excludeContentFilters, 'CRUELTY'];
              addSearchOption();
            }}
          >
            잔인성
          </Checkbox>
          <Checkbox
            class="body-14-m"
            checked={!excludeContentFilters?.includes('PHOBIA')}
            on:change={() => {
              excludeContentFilters = excludeContentFilters?.includes('PHOBIA')
                ? excludeContentFilters.filter((f) => f !== 'PHOBIA')
                : [...excludeContentFilters, 'PHOBIA'];
              addSearchOption();
            }}
          >
            정신질환/공포증
          </Checkbox>
          <Checkbox
            class="body-14-m"
            checked={!excludeContentFilters?.includes('GAMBLING')}
            on:change={() => {
              excludeContentFilters = excludeContentFilters?.includes('GAMBLING')
                ? excludeContentFilters.filter((f) => f !== 'GAMBLING')
                : [...excludeContentFilters, 'GAMBLING'];
              addSearchOption();
            }}
          >
            사행성
          </Checkbox>
          <Checkbox
            class="body-14-m"
            checked={!excludeContentFilters?.includes('TRAUMA')}
            on:change={() => {
              excludeContentFilters = excludeContentFilters?.includes('TRAUMA')
                ? excludeContentFilters.filter((f) => f !== 'TRAUMA')
                : [...excludeContentFilters, 'TRAUMA'];
              addSearchOption();
            }}
          >
            PTSD/트라우마
          </Checkbox>
          <Checkbox
            class="body-14-m"
            checked={!excludeContentFilters?.includes('HORROR')}
            on:change={() => {
              excludeContentFilters = excludeContentFilters?.includes('HORROR')
                ? excludeContentFilters.filter((f) => f !== 'HORROR')
                : [...excludeContentFilters, 'HORROR'];
              addSearchOption();
            }}
          >
            공포성
          </Checkbox>
          <Checkbox
            class="body-14-m"
            checked={!excludeContentFilters?.includes('INSULT')}
            on:change={() => {
              excludeContentFilters = excludeContentFilters?.includes('INSULT')
                ? excludeContentFilters.filter((f) => f !== 'INSULT')
                : [...excludeContentFilters, 'INSULT'];
              addSearchOption();
            }}
          >
            부적절한 언어
          </Checkbox>
          <Checkbox
            class="body-14-m"
            checked={!excludeContentFilters?.includes('OTHER')}
            on:change={() => {
              excludeContentFilters = excludeContentFilters?.includes('OTHER')
                ? excludeContentFilters.filter((f) => f !== 'OTHER')
                : [...excludeContentFilters, 'OTHER'];
              addSearchOption();
            }}
          >
            기타
          </Checkbox>
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
          {orderByText}
          <i class="i-lc-chevron-down square-5" />
        </Button>

        <MenuItem
          on:click={() => {
            orderBy = 'LATEST';
            addSearchOption();
          }}
        >
          최신순
        </MenuItem>
        <MenuItem
          on:click={() => {
            orderBy = 'ACCURACY';
            addSearchOption();
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

        <form
          class="relative h-11.5 max-w-82.5 mb-3"
          on:submit|preventDefault={() => {
            const escapedValue = includeValue.trim().replaceAll(' ', '_');

            if (escapedValue.length === 0) return;

            if (!includeTags.includes(escapedValue)) {
              includeTags = [...includeTags, escapedValue];
            }

            includeValue = '';
            addSearchOption();
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
                addSearchOption();
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
            addSearchOption();
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
                addSearchOption();
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
            addSearchOption();
          }}
        >
          성인물 포함
        </Radio>
        <Radio
          class="gap-2 body-15-sb text-secondary mt-2"
          checked={adultFilter === false}
          on:change={() => {
            adultFilter = false;
            addSearchOption();
          }}
        >
          성인물 제외
        </Radio>
        <Radio
          class="gap-2 body-15-sb text-secondary mt-2"
          checked={adultFilter === true}
          on:change={() => {
            adultFilter = true;
            addSearchOption();
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
        <Checkbox
          class="body-14-m"
          checked={!excludeContentFilters?.includes('GROSSNESS')}
          on:change={() => {
            excludeContentFilters = excludeContentFilters?.includes('GROSSNESS')
              ? excludeContentFilters.filter((f) => f !== 'GROSSNESS')
              : [...excludeContentFilters, 'GROSSNESS'];
            addSearchOption();
          }}
        >
          벌레/징그러움
        </Checkbox>
        <Checkbox
          class="body-14-m"
          checked={!excludeContentFilters?.includes('VIOLENCE')}
          on:change={() => {
            excludeContentFilters = excludeContentFilters?.includes('VIOLENCE')
              ? excludeContentFilters.filter((f) => f !== 'VIOLENCE')
              : [...excludeContentFilters, 'VIOLENCE'];
            addSearchOption();
          }}
        >
          폭력성
        </Checkbox>
        <Checkbox
          class="body-14-m"
          checked={!excludeContentFilters?.includes('CRIME')}
          on:change={() => {
            excludeContentFilters = excludeContentFilters?.includes('CRIME')
              ? excludeContentFilters.filter((f) => f !== 'CRIME')
              : [...excludeContentFilters, 'CRIME'];
            addSearchOption();
          }}
        >
          약물/범죄
        </Checkbox>
        <Checkbox
          class="body-14-m"
          checked={!excludeContentFilters?.includes('CRUELTY')}
          on:change={() => {
            excludeContentFilters = excludeContentFilters?.includes('CRUELTY')
              ? excludeContentFilters.filter((f) => f !== 'CRUELTY')
              : [...excludeContentFilters, 'CRUELTY'];
            addSearchOption();
          }}
        >
          잔인성
        </Checkbox>
        <Checkbox
          class="body-14-m"
          checked={!excludeContentFilters?.includes('PHOBIA')}
          on:change={() => {
            excludeContentFilters = excludeContentFilters?.includes('PHOBIA')
              ? excludeContentFilters.filter((f) => f !== 'PHOBIA')
              : [...excludeContentFilters, 'PHOBIA'];
            addSearchOption();
          }}
        >
          정신질환/공포증
        </Checkbox>
        <Checkbox
          class="body-14-m"
          checked={!excludeContentFilters?.includes('GAMBLING')}
          on:change={() => {
            excludeContentFilters = excludeContentFilters?.includes('GAMBLING')
              ? excludeContentFilters.filter((f) => f !== 'GAMBLING')
              : [...excludeContentFilters, 'GAMBLING'];
            addSearchOption();
          }}
        >
          사행성
        </Checkbox>
        <Checkbox
          class="body-14-m"
          checked={!excludeContentFilters?.includes('TRAUMA')}
          on:change={() => {
            excludeContentFilters = excludeContentFilters?.includes('TRAUMA')
              ? excludeContentFilters.filter((f) => f !== 'TRAUMA')
              : [...excludeContentFilters, 'TRAUMA'];
            addSearchOption();
          }}
        >
          PTSD/트라우마
        </Checkbox>
        <Checkbox
          class="body-14-m"
          checked={!excludeContentFilters?.includes('HORROR')}
          on:change={() => {
            excludeContentFilters = excludeContentFilters?.includes('HORROR')
              ? excludeContentFilters.filter((f) => f !== 'HORROR')
              : [...excludeContentFilters, 'HORROR'];
            addSearchOption();
          }}
        >
          공포성
        </Checkbox>
        <Checkbox
          class="body-14-m"
          checked={!excludeContentFilters?.includes('INSULT')}
          on:change={() => {
            excludeContentFilters = excludeContentFilters?.includes('INSULT')
              ? excludeContentFilters.filter((f) => f !== 'INSULT')
              : [...excludeContentFilters, 'INSULT'];
            addSearchOption();
          }}
        >
          부적절한 언어
        </Checkbox>
        <Checkbox
          class="body-14-m"
          checked={!excludeContentFilters?.includes('OTHER')}
          on:change={() => {
            excludeContentFilters = excludeContentFilters?.includes('OTHER')
              ? excludeContentFilters.filter((f) => f !== 'OTHER')
              : [...excludeContentFilters, 'OTHER'];
            addSearchOption();
          }}
        >
          기타
        </Checkbox>
      </div>
    {/if}
  </div>
</Modal>
