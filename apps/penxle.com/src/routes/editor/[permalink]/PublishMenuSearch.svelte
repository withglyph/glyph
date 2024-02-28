<script lang="ts">
  import * as R from 'radash';
  import IconAlertCircle from '~icons/tabler/alert-circle';
  import { Icon, Tooltip } from '$lib/components';
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

  let formEl: HTMLFormElement;
  let postTags: TagInput[] | undefined = [];
  // let open = false;

  $: postTags = R.group(tags, (tag) => tag.kind)[kind];
</script>

<div>
  <p class="text-14-sb pt-1 pb-2 flex gap-1 <sm:text-15-m">
    <span>{label}</span>
    <Tooltip class="flex center" message={tooltip} placement="top">
      <Icon class="square-3.5 text-gray-400" icon={IconAlertCircle} />
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

      // open = false;
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
          formEl.requestSubmit();
        }
      }}
    />
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
