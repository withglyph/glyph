<script lang="ts">
  import { bundledLanguagesInfo } from 'shiki';
  import { tick } from 'svelte';
  import { slide } from 'svelte/transition';
  import IconSearch from '~icons/glyph/search';
  import IconCheck from '~icons/tabler/check';
  import IconChevronDown from '~icons/tabler/chevron-down';
  import IconChevronUp from '~icons/tabler/chevron-up';
  import { Icon } from '$lib/components';
  import { createFloatingActions, portal } from '$lib/svelte/actions';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import type { NodeViewProps } from '$lib/tiptap';

  export let open = false;

  export let node: NodeViewProps['node'];
  export let updateAttributes: NodeViewProps['updateAttributes'];

  let containerEl: HTMLDivElement;
  let inputEl: HTMLInputElement;
  let query = '';

  const { anchor, floating } = createFloatingActions({
    placement: 'bottom',
    offset: 6,
  });

  const languages = [
    ...bundledLanguagesInfo.map((language) => ({ id: language.id, name: language.name })),
    { id: 'text', name: 'Plain Text' },
  ].toSorted((a, b) => a.name.localeCompare(b.name));

  const scrollIntoView = async () => {
    await tick();

    const top = containerEl.querySelector('button[aria-pressed="true"]')?.getBoundingClientRect().top ?? 0;
    containerEl.scrollTop = top - 180;

    inputEl.focus();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (!open) {
      return;
    }

    if (event.key === 'Escape') {
      open = false;
    }
  };

  $: currentLanguage = languages.find((language) => language.id === node.attrs.language)?.name ?? '?';

  $: if (open) {
    scrollIntoView();
  } else {
    query = '';
  }
</script>

<button
  class={css({
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    fontSize: '14px',
    fontWeight: 'medium',
    color: 'gray.50',
  })}
  type="button"
  on:click={() => (open = true)}
  on:focus={() => (open = true)}
  use:anchor
>
  {currentLanguage}

  {#if open}
    <Icon icon={IconChevronUp} />
  {:else}
    <Icon icon={IconChevronDown} />
  {/if}
</button>

<svelte:window on:keydown={onKeyDown} />

{#if open}
  <div
    class={css({ position: 'fixed', inset: '0', zIndex: '50' })}
    role="button"
    tabindex="-1"
    on:click={() => (open = false)}
    on:keypress={null}
    use:portal
  />

  <div
    bind:this={containerEl}
    class={css({
      position: 'relative',
      paddingBottom: '8px',
      backgroundColor: '[#292D3E]',
      maxHeight: '360px',
      overflowY: 'auto',
      scrollbar: 'hidden',
      zIndex: '50',
      boxShadow: '[2px 2px 8px 0 {colors.gray.900/15}]',
    })}
    use:floating
    in:slide={{ axis: 'y', duration: 250 }}
  >
    <div class={css({ position: 'sticky', top: '0', padding: '14px', backgroundColor: '[#292D3E]' })}>
      <label
        class={flex({
          align: 'center',
          gap: '4px',
          paddingY: '7px',
          paddingLeft: '8px',
          paddingRight: '10px',
          backgroundColor: 'gray.600',
          _focusWithin: { ringWidth: '2px', ringColor: 'brand.400' },
        })}
      >
        <Icon style={css.raw({ color: 'gray.400' })} icon={IconSearch} />
        <input
          bind:this={inputEl}
          class={css({ fontSize: '13px', fontWeight: 'medium', color: 'gray.100' })}
          placeholder="언어를 검색하세요"
          type="text"
          bind:value={query}
        />
      </label>
    </div>

    <ul>
      {#each languages.filter((language) => language.name
          .toLowerCase()
          .includes(query.toLowerCase())) as language (language.id)}
        <li>
          <button
            class={flex({
              align: 'center',
              justify: 'space-between',
              gap: '4px',
              paddingX: '14px',
              paddingY: '6px',
              fontSize: '13px',
              fontWeight: 'medium',
              color: 'gray.100',
              width: 'full',
              backgroundColor: { _hover: 'gray.600', _focus: 'gray.600' },
            })}
            aria-pressed={node.attrs.language === language.id}
            tabIndex={0}
            type="button"
            on:click={() => {
              updateAttributes({ language: language.id });
              open = false;
            }}
          >
            {language.name}

            {#if node.attrs.language === language.id}
              <Icon style={css.raw({ 'color': 'brand.400', '& *': { strokeWidth: '[2]' } })} icon={IconCheck} />
            {/if}
          </button>
        </li>
      {/each}
    </ul>
  </div>
{/if}
