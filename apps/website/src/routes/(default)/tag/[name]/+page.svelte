<script lang="ts">
  import qs from 'query-string';
  import IconDotsVertical from '~icons/tabler/dots-vertical';
  import IconVolume from '~icons/tabler/volume-3';
  import { page } from '$app/stores';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Alert, Button, Helmet, Icon, Pagination } from '$lib/components';
  import { Menu, MenuItem } from '$lib/components/menu';
  import { css } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';
  import Post from '../../(feed)/Post.svelte';
  import LoginRequireAlert from '../../LoginRequireAlert.svelte';

  let loginRequireOpen = false;
  let unmuteTagOpen = false;
  let initialPage = Number(qs.parseUrl($page.url.search).query.page) || 1;

  $: query = graphql(`
    query TagPage_Query($name: String!, $page: Int! = 1) {
      me {
        id
      }

      tag(name: $name) {
        id
        name
        followed
        muted
        postCount
        followerCount

        posts(page: $page, take: 20) {
          id
          ...Feed_Post_post
        }
      }

      ...Feed_Post_query
    }
  `);

  const followTag = graphql(`
    mutation TagPage_FollowTag_Mutation($input: FollowTagInput!) {
      followTag(input: $input) {
        id
        followed
      }
    }
  `);

  const unfollowTag = graphql(`
    mutation TagPage_UnfollowTag_Mutation($input: UnfollowTagInput!) {
      unfollowTag(input: $input) {
        id
        followed
      }
    }
  `);

  const muteTag = graphql(`
    mutation TagPage_MuteTag_Mutation($input: MuteTagInput!) {
      muteTag(input: $input) {
        id
        muted
      }
    }
  `);

  const unmuteTag = graphql(`
    mutation TagPage_UnmuteTag_Mutation($input: UnmuteTagInput!) {
      unmuteTag(input: $input) {
        id
        muted
      }
    }
  `);

  const updatePage = (currentPage: number) => {
    const stringifiedURL = qs.stringifyUrl({ url: $page.url.pathname, query: { page: currentPage } });

    location.href = stringifiedURL;
  };
</script>

<Helmet description={`글리프의 #${$query.tag.name} 태그`} title={`#${$query.tag.name}`} />

<div class={flex({ direction: 'column', grow: '1', paddingX: '20px', backgroundColor: 'gray.0', width: 'full' })}>
  <div
    class={flex({
      direction: 'column',
      marginX: '-20px',
      paddingX: '20px',
      paddingY: { base: '24px', sm: '28px' },
      color: 'gray.0',
      backgroundGradient: 'to-r',
      gradientFrom: '[#323232]',
      gradientTo: 'gray.900',
      minHeight: { base: '144px', sm: '128px' },
    })}
  >
    <div
      class={flex({
        justify: 'space-between',
        gap: '24px',
        marginX: 'auto',
        width: 'full',
        maxWidth: '860px',
      })}
    >
      <div>
        <h1 class={css({ fontSize: { base: '22px', sm: '28px' }, fontWeight: 'bold', wordBreak: 'break-all' })}>
          #{$query.tag.name}
        </h1>
        <span class={css({ marginTop: '2px', fontSize: '14px', color: 'gray.300' })}>
          포스트 {$query.tag.postCount}개
        </span>
        <span class={css({ marginTop: '2px', marginLeft: '10px', fontSize: '14px', color: 'gray.300' })}>
          구독자 {$query.tag.followerCount}명
        </span>
      </div>

      <Menu style={css.raw({ height: 'fit' })} placement="bottom-start">
        <Icon slot="value" style={css.raw({ color: 'gray.50' })} icon={IconDotsVertical} size={24} />

        {#if $query.tag.muted}
          <MenuItem on:click={() => (unmuteTagOpen = true)}>태그 뮤트 해제</MenuItem>
        {:else}
          <MenuItem
            on:click={async () => {
              if (!$query.me) {
                loginRequireOpen = true;
                return;
              }

              await muteTag({ tagId: $query.tag.id });
              mixpanel.track('tag:mute', { tagId: $query.tag.id, via: 'tag' });
            }}
          >
            태그 뮤트
          </MenuItem>
        {/if}
      </Menu>
    </div>
    <div
      class={flex({
        align: 'center',
        justify: 'flex-end',
        gap: '8px',
        marginX: 'auto',
        width: 'full',
        maxWidth: '860px',
        textAlign: 'right',
      })}
    >
      {#if $query.tag.muted}
        <button
          class={center({ backgroundColor: 'red.200', color: 'red.600', size: '37px' })}
          type="button"
          on:click={() => (unmuteTagOpen = true)}
        >
          <Icon icon={IconVolume} />
        </button>
      {/if}
      {#if $query.tag.followed}
        <Button
          style={css.raw({ flex: 'none', backgroundColor: 'gray.300!', width: '86px', height: '37px' })}
          size="sm"
          variant="gray-sub-fill"
          on:click={async () => {
            await unfollowTag({ tagId: $query.tag.id });
            mixpanel.track('tag:unfollow', { tagId: $query.tag.id, via: 'tag' });
          }}
        >
          구독중
        </Button>
      {:else}
        <Button
          style={css.raw({ flex: 'none', width: '86px', height: '37px' })}
          disabled={$query.tag.muted}
          size="sm"
          variant="brand-fill"
          on:click={async () => {
            if (!$query.me) {
              loginRequireOpen = true;
              return;
            }

            await followTag({ tagId: $query.tag.id });
            mixpanel.track('tag:follow', { tagId: $query.tag.id, via: 'tag' });
          }}
        >
          구독
        </Button>
      {/if}
    </div>
  </div>

  <div class={css({ marginX: 'auto', width: 'full', maxWidth: '860px' })}>
    {#if $query.tag.muted}
      <p class={css({ paddingY: '140px', fontSize: '15px', color: 'gray.500', textAlign: 'center' })}>
        해당 태그가 뮤트되어 있어 포스트를 볼 수 없습니다.
        <br />
        포스트를 보시려면 뮤트 설정을 해제해주세요.
      </p>
    {:else}
      <h2 class={css({ marginTop: '24px', fontWeight: 'semibold' })}>포스트</h2>

      <ul>
        {#each $query.tag.posts as post (post.id)}
          <li
            class={css({
              _after: { content: '""', display: 'block', height: '1px', backgroundColor: 'gray.50' },
              _lastOfType: { _after: { display: 'none' } },
            })}
          >
            <Post $post={post} {$query} showBookmark showDate showSpace />
          </li>
        {/each}
      </ul>

      <Pagination
        style={css.raw({ marginTop: '60px', marginBottom: { base: '96px', sm: '120px' } })}
        {initialPage}
        itemsPerPage={20}
        onChange={updatePage}
        totalItems={$query.tag.postCount}
      />
    {/if}
  </div>
</div>

<Alert bind:open={unmuteTagOpen}>
  <svelte:fragment slot="title">태그 뮤트를 해제할까요?</svelte:fragment>

  <svelte:fragment slot="action">
    <Button
      style={css.raw({ hideFrom: 'sm' })}
      size="lg"
      variant="gray-sub-fill"
      on:click={() => (unmuteTagOpen = false)}
    >
      취소
    </Button>
    <Button
      style={css.raw({ hideBelow: 'sm' })}
      size="lg"
      variant="gray-outline"
      on:click={() => (unmuteTagOpen = false)}
    >
      취소
    </Button>
    <Button
      size="lg"
      variant="red-fill"
      on:click={async () => {
        await unmuteTag({ tagId: $query.tag.id });
        mixpanel.track('tag:unmute', { tagId: $query.tag.id, via: 'tag' });
        unmuteTagOpen = false;
      }}
    >
      해제
    </Button>
  </svelte:fragment>
</Alert>

<LoginRequireAlert bind:open={loginRequireOpen} />
