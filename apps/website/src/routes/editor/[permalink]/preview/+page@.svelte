<script lang="ts">
  import { toUint8Array } from 'js-base64';
  import { onMount } from 'svelte';
  import { yDocToProsemirrorJSON } from 'y-prosemirror';
  import * as Y from 'yjs';
  import IconDeviceDesktop from '~icons/tabler/device-desktop';
  import IconDeviceMobile from '~icons/tabler/device-mobile';
  import { page } from '$app/stores';
  import FullLogo from '$assets/logos/full.svg?component';
  import { graphql } from '$glitch';
  import { Helmet, Icon } from '$lib/components';
  import { Button } from '$lib/components/v2';
  import { TiptapEditor } from '$lib/tiptap/components';
  import { css } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';
  import type { Editor } from '@tiptap/core';

  let mode: 'desktop' | 'mobile' = 'desktop';

  $: hideHeader = $page.url.searchParams.get('hideHeader') === 'true';

  $: query = graphql(`
    query EditorPermalinkPreviewPage_Query($permalink: String!) {
      post(permalink: $permalink) {
        id

        contentState {
          id
          update
        }
      }
    }
  `);

  let document: Y.Doc;
  let title = '';
  let subtitle = '';
  let editor: Editor;

  onMount(() => {
    document = new Y.Doc({ gc: false });
    Y.applyUpdateV2(document, toUint8Array($query.post.contentState.update));

    title = document.getText('title').toString();
    subtitle = document.getText('subtitle').toString();
    editor
      .chain()
      .setMeta('antifreeze', true)
      .setContent(yDocToProsemirrorJSON(document, 'content'))
      .setTextSelection(0)
      .run();
  });
</script>

<Helmet description="포스트 미리보기" title={`${title || '(제목 없음)'} 미리보기`} />

{#if !hideHeader}
  <header
    class={center({
      position: 'sticky',
      top: '0',
      borderBottomWidth: '1px',
      borderBottomColor: 'gray.200',
      paddingX: '20px',
      paddingY: '12px',
      height: '61px',
      backgroundColor: 'gray.5',
      zIndex: '10',
    })}
  >
    <nav class={css({ width: 'full', maxWidth: '1200px' })}>
      <section class={flex({ position: 'relative', justify: 'space-between', align: 'center' })}>
        <div
          class={flex({
            position: 'absolute',
            left: '0',
            align: 'center',
            gap: '8px',
            marginTop: '8px',
            marginBottom: '4px',
            marginRight: { base: '14px', sm: '16px' },
            transition: 'common',
          })}
        >
          <FullLogo class={css({ height: '25px', color: 'gray.900' })} />
        </div>
        <div class={center({ flexGrow: '1' })}>
          <button
            class={flex({
              align: 'center',
              gap: '4px',
              paddingX: '20px',
              paddingY: '20px',
              height: '37px',
              zIndex: '1',
              backgroundColor: mode === 'desktop' ? 'gray.900' : 'gray.100',
              color: mode === 'desktop' ? 'gray.50' : 'gray.800',
              transition: 'colors',
            })}
            type="button"
            on:click={() => {
              mode = 'desktop';
            }}
          >
            <Icon icon={IconDeviceDesktop} size={16} />
          </button>
          <button
            class={flex({
              align: 'center',
              gap: '4px',
              paddingX: '20px',
              paddingY: '20px',
              height: '37px',
              zIndex: '1',
              backgroundColor: mode === 'mobile' ? 'gray.900' : 'gray.100',
              color: mode === 'mobile' ? 'gray.50' : 'gray.800',
              transition: 'colors',
            })}
            type="button"
            on:click={() => {
              mode = 'mobile';
            }}
          >
            <Icon icon={IconDeviceMobile} size={20} />
          </button>
        </div>
        <Button style={css.raw({ width: '68px' })} size="sm" variant="gray-outline" on:click={() => window.close()}>
          확인
        </Button>
      </section>
    </nav>
  </header>
{/if}

<main
  class={flex({
    direction: 'column',
    justify: 'center',
    align: 'flex-start',
    grow: '1',
    margin: 'auto',
    width: 'full',
    backgroundColor: 'gray.800',
  })}
>
  <div
    class={flex({
      direction: 'column',
      grow: '1',
      marginX: 'auto',
      paddingY: '20px',
      width: 'full',
      backgroundColor: 'gray.5',
      sm: { paddingTop: '34px' },
      maxWidth: mode === 'desktop' ? '940px' : '375px',
    })}
  >
    <div
      class={css({
        borderBottomWidth: '1px',
        borderBottomColor: 'gray.200',
        marginX: mode === 'desktop' ? '40px' : '20px',
        marginBottom: '20px',
        paddingBottom: '10px',
      })}
    >
      <input
        class={css({ width: 'full', fontSize: mode === 'desktop' ? '28px' : '22px', fontWeight: 'bold' })}
        maxlength="100"
        placeholder="제목을 입력하세요"
        readonly
        type="text"
        value={title}
      />

      <input
        class={css({ marginTop: '4px', width: 'full', fontSize: '16px', fontWeight: 'medium' })}
        maxlength="100"
        placeholder="부제목을 입력해주세요"
        readonly
        type="text"
        value={subtitle}
      />
    </div>

    <div class={flex({ grow: '1', paddingX: mode === 'desktop' ? '40px' : '20px', width: 'full' })}>
      <TiptapEditor style={css.raw({ flexGrow: '1', maxWidth: 'full' })} frozen bind:editor />
    </div>
  </div>
</main>
