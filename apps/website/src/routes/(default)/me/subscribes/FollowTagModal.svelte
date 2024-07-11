<script lang="ts">
  import IconTrash from '~icons/tabler/trash';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Icon, Modal } from '$lib/components';
  import { isWebView, postFlutterMessage } from '$lib/flutter';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import type { MeCabinetsPage_FollowTagModal_user } from '$glitch';

  let _user: MeCabinetsPage_FollowTagModal_user;
  export { _user as $user };
  export let open = false;

  $: user = fragment(
    _user,
    graphql(`
      fragment MeCabinetsPage_FollowTagModal_user on User {
        id

        followedTags {
          id
          name
        }
      }
    `),
  );

  const unfollowTag = graphql(`
    mutation MeCabinetsPage_UnfollowTag_Mutation($input: UnfollowTagInput!) {
      unfollowTag(input: $input) {
        id
      }
    }
  `);
</script>

<Modal bind:open>
  <svelte:fragment slot="title">구독한 태그 편집</svelte:fragment>

  <p class={css({ marginBottom: '4px', fontSize: '14px', color: 'gray.500' })}>
    총 {$user.followedTags.length}개의 태그
  </p>

  <ul class={css({ marginX: '-20px', minHeight: '170px' })}>
    {#each $user.followedTags as tag (tag.id)}
      <li
        class={flex({ align: 'center', justify: 'space-between', gap: '24px', _hover: { backgroundColor: 'gray.50' } })}
      >
        {#if $isWebView}
          <button
            class={css({
              display: 'inline-block',
              flexGrow: '1',
              paddingLeft: '20px',
              paddingY: '16px',
              fontSize: '15px',
              textAlign: 'left',
            })}
            type="button"
            on:click={() => {
              postFlutterMessage({ type: 'tag:view', name: tag.name });
            }}
          >
            #{tag.name}
          </button>
        {:else}
          <a
            class={css({
              display: 'inline-block',
              flexGrow: '1',
              paddingLeft: '20px',
              paddingY: '16px',
              fontSize: '15px',
            })}
            href="/tag/{tag.name}"
          >
            #{tag.name}
          </a>
        {/if}

        <button
          class={css({ paddingRight: '20px', paddingY: '16px' })}
          type="button"
          on:click={async () => {
            await unfollowTag({ tagId: tag.id });
            mixpanel.track('tag:unfollow', { via: 'cabinet' });
          }}
        >
          <Icon style={css.raw({ color: 'gray.500' })} icon={IconTrash} size={24} />
        </button>
      </li>
    {:else}
      <li
        class={css({
          paddingY: '77px',
          fontSize: '14px',
          color: 'gray.500',
          textAlign: 'center',
        })}
      >
        구독한 태그가 없어요
      </li>
    {/each}
  </ul>
</Modal>
