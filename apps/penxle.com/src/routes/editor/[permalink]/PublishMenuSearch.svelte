<script lang="ts">
  import * as R from 'radash';
  import IconHelpLine from '~icons/effit/help-line';
  import IconHash from '~icons/tabler/hash';
  import IconX from '~icons/tabler/x';
  import { Icon, Tag, Tooltip } from '$lib/components';
  import { TextInput } from '$lib/components/v2/forms';
  import { tagPattern } from '$lib/const/post';
  import { toast } from '$lib/notification';
  import { outsideClickEvent } from '$lib/svelte/actions';
  import { css } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import type { PostTagKind } from '$glitch';

  type TagInput = {
    name: string;
    kind: PostTagKind;
  };

  type $$Props = HTMLInputAttributes & {
    query: string;
    tags: TagInput[];
    kind: PostTagKind;
    label: string;
    tooltip: string;
  };

  export let query = '';
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
  <p
    class={flex({
      gap: '4px',
      paddingBottom: '8px',
      fontSize: '14px',
    })}
  >
    <span>{label}</span>
    <Tooltip style={center.raw()} message={tooltip} placement="top">
      <Icon style={css.raw({ color: 'gray.400' })} icon={IconHelpLine} size={12} />
    </Tooltip>
  </p>

  <form
    bind:this={formEl}
    class={css({ position: 'relative' })}
    on:submit|preventDefault={() => {
      const escapedValue = query.trim().replace(/^#/, '').replaceAll(' ', '_');

      if (escapedValue.length === 0) return;

      if (tags.some((tag) => tag.name === escapedValue)) {
        toast('중복된 태그는 입력할 수 없어요');
        return;
      }

      if (!tagPattern.test(escapedValue)) {
        toast('허용되지 않은 문자를 태그로 입력했어요');
        return;
      }

      tags = [...tags, { kind, name: escapedValue }];

      // open = false;
      query = '';
    }}
    use:outsideClickEvent
  >
    <TextInput
      size="sm"
      type="search"
      bind:value={query}
      on:blur={() => {
        if (query.length > 0) {
          formEl.requestSubmit();
        }
      }}
      {...$$restProps}
    >
      <Icon slot="left-icon" icon={IconHash} />
    </TextInput>
  </form>

  {#if postTags}
    <ul class={flex({ gap: '6px', wrap: 'wrap', paddingY: '10px' })}>
      {#each postTags as tag (tag.name)}
        <Tag as="label" size="sm" on:change={() => (tags = tags.filter((t) => t.name !== tag.name))}>
          {tag.name}
          <Icon slot="right-icon" icon={IconX} size={12} />
        </Tag>
      {/each}
    </ul>
  {/if}
</div>
