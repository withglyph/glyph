<script lang="ts">
  import IconPlus from '~icons/tabler/plus';
  import { goto } from '$app/navigation';
  import Logo from '$assets/icons/logo.svg?component';
  import Wordmark from '$assets/icons/wordmark.svg?component';
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
    paddingX: { base: '20px', sm: '40px' },
    top: '0',
    height: { base: '56px', sm: '77px' },
    backgroundColor: 'gray.5',
    zIndex: '10',
  })}
>
  <nav class={css({ width: 'full', maxWidth: '1200px' })}>
    <section class={flex({ justify: 'space-between', align: 'center' })}>
      <a class={flex({ align: 'center', gap: '7px', marginRight: '24px' })} href="/">
        <Logo class={css({ size: { base: '14px', sm: '21px' } })} />
        <Wordmark class={css({ height: { base: '14px', sm: '19px' } })} />
      </a>

      <div
        class={flex({
          flex: '1',
          justify: { base: 'flex-end', sm: 'space-between' },
          align: 'center',
          sm: { gap: '12px' },
        })}
      >
        <SearchBar style={css.raw({ flex: '1', maxWidth: { base: '400px', smDown: { _focusWithin: 'full' } } })} />

        <div class={flex({ align: 'center', gap: { base: '12px', sm: '14px' } })}>
          {#if $query.me}
            <Button
              style={flex.raw({
                align: 'center',
                gap: '4px',
                paddingLeft: '12px',
                paddingRight: '14px',
                color: 'gray.800',
                fontSize: '14px',
                fontWeight: 'semibold',
                hideBelow: 'sm',
              })}
              size="md"
              type="button"
              variant="outline"
              on:click={async () => {
                const { permalink } = await createPost({ spaceId: undefined });
                mixpanel.track('post:create', { via: 'feed' });
                await goto(`/editor/${permalink}`);
              }}
            >
              <Icon style={css.raw({ size: '14px' })} icon={IconPlus} />
              포스트 작성
            </Button>
            <NotificationMenu $user={$query.me} />
            <UserMenu $user={$query.me} />
          {:else}
            <Button style={css.raw({ hideFrom: 'sm' })} href="/login" size="sm" type="link" variant="outline">
              로그인/회원가입
            </Button>
            <Button style={css.raw({ hideBelow: 'sm' })} href="/login" size="md" type="link" variant="outline">
              로그인/회원가입
            </Button>
          {/if}
        </div>
      </div>
    </section>
  </nav>
</header>
