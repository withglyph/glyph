<script lang="ts">
  import { Link } from '@penxle/ui';
  import { goto } from '$app/navigation';
  import Logo from '$assets/icons/logo.svg?component';
  import Wordmark from '$assets/icons/wordmark.svg?component';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Button } from '$lib/components/v2';
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
          ...DefaultLayout_Notification_user
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

<header class="relative sticky top-0 z-10 border-b border-gray-100 bg-white px-5 flex center h-56px sm:(px-10 h-77px)">
  <nav class="w-full max-w-300">
    <section class="flex items-center justify-between">
      <Link class="mr-4 flex items-center gap-7px sm:mr-4 transition w-fit" href="/">
        <Logo class="<sm:square-14px sm:square-21px" />
        <Wordmark class="h-13px sm:h-19px" />
      </Link>

      <div class="flex flex-1 items-center justify-between">
        <SearchBar class="flex-1 max-w-80 <sm:focus-within:max-w-full peer" />

        <div class="flex items-center gap-3 relative">
          {#if $query.me}
            <Button
              class="flex items-center gap-1 text-14-sb! text-gray-700 <sm:hidden"
              size="md"
              type="button"
              variant="outline"
              on:click={async () => {
                const { permalink } = await createPost({ spaceId: undefined });
                mixpanel.track('post:create', { via: 'feed' });
                await goto(`/editor/${permalink}`);
              }}
            >
              <i class="i-tb-plus square-3.5 block" />
              포스트 작성
            </Button>
            <NotificationMenu $user={$query.me} />
            <UserMenu $user={$query.me} />
          {:else}
            <Button href="/login" size="md" type="link" variant="outline">로그인/회원가입</Button>
          {/if}
        </div>
      </div>
    </section>
  </nav>
</header>
