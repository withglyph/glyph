<script lang="ts">
  import IconPlus from '~icons/tabler/plus';
  import { goto } from '$app/navigation';
  import FullLogo from '$assets/logos/full.svg?component';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Icon } from '$lib/components';
  import { Button } from '$lib/components/v2';
  import { css } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';
  import NotificationMenu from './NotificationMenu.svelte';
  import SearchBar from './SearchBar.svelte';
  import UserMenu from './UserMenu.svelte';
  import type { DefaultLayout_Header_query } from '$glitch';

  let _query: DefaultLayout_Header_query;
  export { _query as $query };

  $: query = fragment(
    _query,
    graphql(`
      fragment DefaultLayout_Header_query on Query {
        me {
          id
          email

          profile {
            id
            name
          }

          ...DefaultLayout_UserMenu_user
          ...DefaultLayout_NotificationMenu_user
        }
      }
    `),
  );

  const createPost = graphql(`
    mutation DefaultLayout_Header_CreatePost_Mutation($input: CreatePostInput!) {
      createPost(input: $input) {
        id
        permalink
      }
    }
  `);
</script>

<header
  class={center({
    position: 'sticky',
    borderBottomWidth: '1px',
    borderBottomColor: 'gray.100',
    paddingX: '20px',
    top: '0',
    backgroundColor: 'gray.5',
    zIndex: '10',
  })}
>
  <nav
    class={flex({
      width: 'full',
      maxWidth: '1280px',
      justify: 'space-between',
      align: 'center',
      position: 'relative',
      gap: '24px',
    })}
  >
    <a
      class={css({
        sm: { marginTop: '20px', marginBottom: '17px' },
        smDown: { marginTop: '18px', marginBottom: '13px' },
      })}
      href="/"
    >
      <FullLogo class={css({ height: '25px', color: 'gray.900' })} />
    </a>

    <SearchBar
      style={css.raw({
        position: 'absolute',
        left: '[50%]',
        transform: 'translateX(-50%)',
        marginRight: '130px',
        flex: '1',
        hideBelow: 'sm',
        maxWidth: '[32%]',
        width: 'full',
      })}
      open
    />

    <div class={flex({ align: 'center', gap: { base: '24px', sm: '28px' } })}>
      <SearchBar style={css.raw({ hideFrom: 'sm', maxWidth: 'full' })} />
      {#if $query.me}
        <Button
          style={flex.raw({
            align: 'center',
            gap: '4px',
            paddingLeft: '12px',
            paddingRight: '14px',
            hideBelow: 'sm',
          })}
          size="sm"
          type="button"
          variant="gray-outline"
          on:click={async () => {
            const { permalink } = await createPost({ spaceId: undefined });
            mixpanel.track('post:create', { via: 'feed' });
            await goto(`/editor/${permalink}`);
          }}
        >
          <Icon icon={IconPlus} />
          포스트 작성
        </Button>
        <NotificationMenu $user={$query.me} />
        <UserMenu $user={$query.me} />
      {:else}
        <Button href="/login" size="sm" type="link" variant="gray-outline">로그인/회원가입</Button>
      {/if}
    </div>
  </nav>
</header>
