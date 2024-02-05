<script lang="ts">
  import * as R from 'radash';
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

  export let query = '';
  export let placeholder: string | undefined = undefined;
  export let tags: TagInput[] = [];
  export let kind: PostTagKind;
  export let label: string;
  export let tooltip: string = label;

  let postTags: TagInput[] | undefined = [];
  // let open = false;

  $: postTags = R.group(tags, (tag) => tag.kind)[kind];
</script>

<div>
  <p class="text-18-m mb-3 flex gap-1.5 pt-5">
    <span>{label}</span>
    <Tooltip class="flex center" message={tooltip} placement="top">
      <i class="i-tb-alert-circle square-3.5 text-gray-400" />
    </Tooltip>
  </p>

  <form
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

      // open = false;
      query = '';
    }}
    use:outsideClickEvent
  >
    <!-- on:outsideClick={() => (open = false)} -->
    <input
      class="rounded-1.5 bg-gray-50 py-2.5 pl-4 pr-4 text-14-r border border-gray-200 w-full"
      {placeholder}
      type="search"
      bind:value={query}
    />
    <!-- on:input={() => (open = true)} -->
    <!-- <div class="absolute inset-y-0 right-4 flex center text-gray-700">
      <i class="i-tb-search square-4" />
    </div> -->

    <!-- {#if open}
      <ul class="absolute left-0 w-full bg-white border border-gray-200 rounded-b-1.5 z-1">
        <li class="hover:bg-gray-100 last-of-type:rounded-b-1.5">
          <button
            class="py-2 px-1.5 w-full"
            type="button"
            on:click={() => {
              open = false;
              query = '';
            }}
          >
            <i class="i-tb-search square-3 text-gray-400 m-1.5" />
            <span class="text-12-r">검색 결과</span>
          </button>
        </li>
      </ul>
    {/if} -->
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
