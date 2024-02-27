<script lang="ts">
  import * as R from 'radash';
  import { graphql } from '$glitch';
  import { Tooltip } from '$lib/components';
  import { tagPattern } from '$lib/const/post';
  import { toast } from '$lib/notification';
  import { outsideClickEvent } from '$lib/svelte/actions';
  import Chip from './Chip.svelte';
  import type { PostTagKind } from '$glitch';

  type TagInput = {
    name: string;
    kind: PostTagKind;
  };

  $: autoCompleteTag = graphql(`
    query PublishMenuSearch_AutoCompleteTag($kind: PostTagKind!, $query: String!, $excludeTags: [String!]) @_manual {
      autoCompleteTags(kind: $kind, query: $query, excludeTags: $excludeTags) {
        id
        name
        usageCount {
          CHARACTER
          COUPLING
          EXTRA
          TITLE
          TRIGGER
        }
      }
    }
  `);

  export let query = '';
  export let placeholder: string | undefined = undefined;
  export let tags: TagInput[] = [];
  export let kind: PostTagKind;
  export let label: string;
  export let tooltip: string = label;

  let formEl: HTMLFormElement;
  let postTags: TagInput[] | undefined = [];
  let open = false;
  let autoCompleteTags: { id: string; name: string; usageCount: Record<PostTagKind, number> }[] = [];

  $: postTags = R.group(tags, (tag) => tag.kind)[kind];

  const refetchTags = R.debounce({ delay: 150 }, async () => {
    if (query.length === 0) {
      autoCompleteTags = [];
      return;
    }
    const queriedTags = await autoCompleteTag.refetch({ kind, query });
    autoCompleteTags = queriedTags.autoCompleteTags.filter(
      (tag) => !postTags?.some((postTag) => postTag.name === tag.name),
    );
  });
</script>

<div>
  <p class="text-14-sb pt-1 pb-2 flex gap-1 <sm:text-15-m">
    <span>{label}</span>
    <Tooltip class="flex center" message={tooltip} placement="top">
      <i class="i-tb-alert-circle square-3.5 text-gray-400" />
    </Tooltip>
  </p>

  <form
    bind:this={formEl}
    class="relative"
    on:submit|preventDefault={() => {
      const escapedValue = query.trim().replace(/^#/, '').replaceAll(' ', '_');

      if (escapedValue.length === 0) return;

      if (tags.some((tag) => tag.name === escapedValue)) {
        toast.error('중복된 태그는 입력할 수 없어요');
        return;
      }

      if (!tagPattern.test(escapedValue)) {
        toast.error('허용되지 않은 문자를 태그로 입력했어요');
        return;
      }

      tags = [...tags, { kind, name: escapedValue }];

      open = false;
      autoCompleteTags = [];
      query = '';
    }}
    use:outsideClickEvent
  >
    <input
      class="rounded-1.5 py-2.5 pl-4 pr-4 text-14-r border border-gray-200 w-full"
      {placeholder}
      type="search"
      bind:value={query}
      on:blur={() => {
        if (query.length > 0) {
          // formEl.requestSubmit();
        }
        if (window.innerWidth >= 800) {
          open = false;
        }
      }}
      on:focus={() => {
        if (query.length > 0) {
          open = true;
        }
      }}
      on:input={async () => {
        open = true;
        refetchTags();
      }}
    />

    <div class="absolute inset-y-0 right-4 flex center text-gray-700">
      <i class="i-tb-search square-4" />
    </div>

    {#if open}
      <ul class="absolute left-0 w-full bg-white border border-gray-200 rounded-b-1.5 z-1">
        {#each autoCompleteTags as tag (tag.id)}
          <li class="hover:bg-gray-100 last-of-type:rounded-b-1.5">
            <button
              class="py-2 px-1.5 w-full"
              type="button"
              on:click={() => {
                query = tag.name;
                open = false;
                formEl.requestSubmit();
              }}
            >
              <i class="i-tb-search square-3 text-gray-400 m-1.5" />
              <span class="text-12-r">
                {tag.name}
              </span>
              <span class="flex-grow text-right text-10-r">{tag.usageCount[kind]}회 사용</span>
            </button>
          </li>
        {:else}
          <li class="hover:bg-gray-100 last-of-type:rounded-b-1.5">
            <button class="py-2 px-1.5 w-full" type="button">
              <i class="i-tb-search square-3 text-gray-400 m-1.5" />
              <span class="text-12-r">
                {#if query.length > 0}
                  결과가 없어요
                {:else}
                  태그를 입력해주세요
                {/if}
              </span>
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </form>

  {#if postTags}
    <ul class="flex flex-wrap gap-1.5 py-2.5">
      {#each postTags as tag (tag.name)}
        <Chip on:click={() => (tags = tags.filter((t) => t.name !== tag.name))}>
          {tag.name}
        </Chip>
      {/each}
    </ul>
  {/if}
</div>
