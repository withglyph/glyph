<script lang="ts">
  import IconPencil from '~icons/tabler/pencil';
  import { graphql } from '$glitch';
  import { Button, Helmet, Icon } from '$lib/components';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import ComingSoonModal from '../../../ComingSoonModal.svelte';

  $: query = graphql(`
    query TagPage_Query($name: String!) {
      tag(name: $name) {
        id
        name
      }
    }
  `);

  let comingSoonOpen = false;
</script>

<Helmet description={`글리프의 #${$query.tag.name} 태그`} title={`#${$query.tag.name}`} />

<div class={flex({ justify: 'space-between', align: 'center' })}>
  <p class={css({ fontSize: '20px', fontWeight: 'bold' })}>내용</p>
  <Button
    style={flex.raw({ gap: '4px', borderRadius: '16px', paddingX: '8px', height: '26px' })}
    color="tertiary"
    variant="outlined"
    on:click={() => (comingSoonOpen = true)}
  >
    <span class={css({ fontSize: '13px', fontWeight: 'bold' })}>편집</span>
    <Icon icon={IconPencil} />
  </Button>
</div>

<div class={css({ gap: '32px', borderWidth: '1px', borderColor: 'gray.200', borderRadius: '16px', padding: '24px' })}>
  <div class={css({ marginY: '12px', fontSize: '16px', textAlign: 'center', color: 'gray.500' })}>
    <p>아직 내용이 없어요</p>
    <p>위키의 내용을 작성해 보세요</p>
  </div>
</div>

<ComingSoonModal bind:open={comingSoonOpen} />
