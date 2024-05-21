<script lang="ts">
  import IconHash from '~icons/tabler/hash';
  import IconX from '~icons/tabler/x';
  import { Icon, Tag } from '$lib/components';
  import { TextInput } from '$lib/components/v2/forms';
  import { outsideClickEvent } from '$lib/svelte/actions';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import type { HTMLInputAttributes } from 'svelte/elements';

  type $$Props = HTMLInputAttributes & {
    tags: string[];
    updateSearchFilter?: (page: number) => void;
  };

  export let value: HTMLInputAttributes['value'] = undefined;
  export let tags: string[] = [];
  export let updateSearchFilter: ((page: number) => void) | undefined = undefined;

  let formEl: HTMLFormElement;
</script>

<div>
  <p class={css({ marginBottom: '12px', fontWeight: 'semibold' })}>
    <slot />
  </p>

  <form
    bind:this={formEl}
    on:submit|preventDefault={() => {
      const escapedValue = value.trim().replaceAll(' ', '_');

      if (escapedValue.length === 0) return;

      value = '';

      if (!tags.includes(escapedValue)) {
        tags = [...tags, escapedValue];

        if (updateSearchFilter) updateSearchFilter(1);
      }
    }}
    on:outsideClick={() => {
      if (value.length > 0) {
        formEl.requestSubmit();
      }
    }}
    on:reset={() => (value = '')}
    use:outsideClickEvent
  >
    <TextInput size="md" bind:value {...$$restProps}>
      <Icon slot="left-icon" icon={IconHash} />
      <button
        slot="right-icon"
        class={css({ _disabled: { visibility: 'hidden' } })}
        disabled={value.length === 0}
        type="reset"
      >
        <Icon icon={IconX} />
      </button>
    </TextInput>
  </form>

  <div class={flex({ flexWrap: 'wrap', gap: '6px', marginTop: '6px' })}>
    {#each tags as tag (tag)}
      <Tag
        style={css.raw({
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          color: 'gray.0',
          backgroundColor: 'brand.400',
          width: 'fit',
          cursor: 'pointer',
        })}
        as="label"
        on:change={() => {
          tags = tags.filter((t) => t !== tag);

          if (updateSearchFilter) updateSearchFilter(1);
        }}
      >
        #{tag}
        <Icon slot="right-icon" icon={IconX} size={12} />
      </Tag>
    {/each}
  </div>
</div>
