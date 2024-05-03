<script lang="ts">
  import { graphql } from '$bifrost';
  import { Tag } from '$lib/components';
  import { css } from '$styled-system/css';
  import { flex, grid } from '$styled-system/patterns';
  import FollowTagModal from './FollowTagModal.svelte';
  import Space from './Space.svelte';

  let followTagOpen = false;

  $: query = graphql(`
    query MeSubscribesPage_Query {
      auth(scope: USER)

      me @_required {
        id
        ...MeCabinetsPage_FollowTagModal_user

        followedSpaces {
          id
          ...Space_space
        }

        followedTags {
          id
          name
        }
      }
    }
  `);
</script>

<h1 class={css({ fontSize: '24px', fontWeight: 'bold', hideBelow: 'sm' })}>구독</h1>

<div class={css({ marginTop: { base: '16px', sm: '32px' }, paddingBottom: '24px', smDown: { paddingX: '20px' } })}>
  <div class={flex({ align: 'center' })}>
    <h2 class={css({ fontSize: '18px', fontWeight: 'semibold' })}>태그</h2>

    <button
      class={css({
        paddingX: '8px',
        fontSize: '14px',
        color: { base: 'brand.400', _disabled: 'gray.300' },
        textDecoration: 'underline',
      })}
      disabled={$query.me.followedTags.length === 0}
      type="button"
      on:click={() => (followTagOpen = true)}
    >
      편집
    </button>
  </div>

  <p class={css({ marginTop: '4px', marginBottom: '10px', fontSize: '12px', color: 'gray.500' })}>
    총 {$query.me.followedTags.length}개의 태그
  </p>

  {#if $query.me.followedTags.length > 0}
    <ul class={flex({ align: 'center', wrap: 'wrap', gap: '8px' })}>
      {#each $query.me.followedTags as tag (tag.id)}
        <li class={css({ truncate: true })}>
          <Tag href="/tag/{tag.name}">#{tag.name}</Tag>
        </li>
      {/each}
    </ul>
  {:else}
    <p class={css({ paddingY: '77px', fontSize: '14px', color: 'gray.500', textAlign: 'center' })}>
      구독한 태그가 없어요
    </p>
  {/if}
</div>

<div class={css({ marginTop: '34px', smDown: { paddingX: '20px' } })}>
  <h2 class={css({ fontSize: '18px', fontWeight: 'semibold' })}>스페이스</h2>

  <p
    class={css({
      marginTop: '4px',
      paddingBottom: '10px',
      fontSize: '12px',
      color: 'gray.500',
      smDown: { marginX: '-20px', paddingX: '20px' },
    })}
  >
    총 {$query.me.followedSpaces.length}개의 스페이스
  </p>

  {#if $query.me.followedSpaces.length > 0}
    <ul
      class={grid({
        columns: { base: 1, sm: 2 },
        smDown: { gap: '0' },
        sm: { rowGap: '20px', columnGap: '14px' },
      })}
    >
      {#each $query.me.followedSpaces as space (space.id)}
        <li class={css({ smDown: { _firstOfType: { '& > div > a': { paddingTop: '0' } } } })}>
          <Space $space={space} />
        </li>
      {/each}
    </ul>
  {:else}
    <p class={css({ paddingY: '77px', fontSize: '14px', color: 'gray.500', textAlign: 'center' })}>
      구독한 스페이스가 없어요
    </p>
  {/if}
</div>

<FollowTagModal $user={$query.me} bind:open={followTagOpen} />
