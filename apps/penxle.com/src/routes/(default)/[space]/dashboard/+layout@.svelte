<script lang="ts">
  import IconEffit from '~icons/effit/effit';
  import IconChevronDown from '~icons/tabler/chevron-down';
  import IconFileText from '~icons/tabler/file-text';
  import IconHome from '~icons/tabler/home';
  import IconSettings from '~icons/tabler/settings';
  import IconUser from '~icons/tabler/user';
  import IconUsers from '~icons/tabler/users';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Avatar, BottomSheet, Button, Icon, Image, Tooltip } from '$lib/components';
  import { pageSubTitle } from '$lib/stores';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import ComingSoonModal from '../../ComingSoonModal.svelte';
  import Footer from '../../Footer.svelte';
  import Header from '../../Header.svelte';
  import SpaceListMenu from './SpaceListMenu.svelte';
  import UpdateSpaceProfileModal from './UpdateSpaceProfileModal.svelte';

  let open = false;
  let updateSpaceProfileOpen = false;
  let comingSoonOpen = false;

  $: query = graphql(`
    query SpaceDashboardLayout_Query($slug: String!) {
      ...DefaultLayout_Header_query
      ...SpaceDashboardLayout_SpaceListMenu_query
      ...SpaceDashboardLayout_UpdateSpaceProfileModal_query

      space(slug: $slug) {
        id
        slug
        name
        visibility

        icon {
          id
          ...Image_image
        }

        meAsMember @_required {
          id

          profile {
            id
            name

            ...Avatar_profile
          }
        }
      }
    }
  `);

  const createPost = graphql(`
    mutation SpaceDashboardLayout_CreatePost_Mutation($input: CreatePostInput!) {
      createPost(input: $input) {
        id
        permalink
      }
    }
  `);
</script>

<Header {$query} />

<main class={flex({ justify: 'center', grow: '1', smDown: { flexDirection: 'column' } })}>
  <button
    class={flex({
      justify: 'space-between',
      align: 'center',
      borderBottomWidth: '1px',
      borderBottomColor: 'gray.200',
      padding: '16px',
      hideFrom: 'sm',
    })}
    type="button"
    on:click={() => (open = true)}
  >
    <h2 class={css({ fontWeight: 'semibold' })}>{$pageSubTitle}</h2>
    <Icon style={css.raw({ size: '24px' })} icon={IconChevronDown} />
  </button>

  <aside class={flex({ justify: 'flex-end', width: 'full', maxWidth: '339px', hideBelow: 'sm' })}>
    <div class={css({ paddingX: '16px', width: '208px' })}>
      <h1 class={css({ marginTop: '40px', fontWeight: 'bold' })}>스페이스 관리</h1>

      <div class={flex({ direction: 'column', gap: '12px', marginY: '22px' })}>
        <SpaceListMenu {$query} />

        <div class={flex({ justify: 'space-between', align: 'center', gap: '4px', paddingX: '8px', paddingY: '10px' })}>
          {#if $query.space.meAsMember}
            <div class={flex({ align: 'center', truncate: true })}>
              <Avatar
                style={css.raw({ flex: 'none', marginRight: '12px', size: '24px' })}
                $profile={$query.space.meAsMember.profile}
              />
              <span class={css({ flexGrow: '1', fontSize: '14px', fontWeight: 'bold', truncate: true })}>
                {$query.space.meAsMember.profile.name}
              </span>
            </div>
            <button
              class={css({ flex: 'none', fontSize: '12px', fontWeight: 'medium', color: 'gray.500' })}
              type="button"
              on:click={() => (updateSpaceProfileOpen = true)}
            >
              수정
            </button>
          {/if}
        </div>

        <Button
          style={css.raw({ width: 'full' })}
          color="tertiary"
          size="xl"
          variant="outlined"
          on:click={async () => {
            const { permalink } = await createPost({ spaceId: $query.space.id });
            mixpanel.track('post:create', { via: 'space-dashboard' });
            await goto(`/editor/${permalink}`);
          }}
        >
          새 포스트 작성하기
        </Button>
      </div>

      <nav class={css({ marginBottom: '40px', width: 'full' })}>
        <ul class={flex({ direction: 'column', gap: '4px', fontWeight: 'bold', color: 'gray.500' })}>
          <li>
            <Tooltip message="준비중인 기능이에요">
              <button
                class={css(
                  {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    borderRadius: '16px',
                    paddingX: '8px',
                    paddingY: '26px',
                    width: 'full',
                    _hover: {
                      color: 'gray.900',
                      backgroundColor: 'gray.50',
                    },
                  },
                  $page.url.pathname === `/${$query.space.slug}/dashboard` && {
                    color: 'gray.900',
                    backgroundColor: 'gray.50',
                  },
                )}
                disabled
                type="button"
              >
                <Icon style={css.raw({ size: '20px' })} icon={IconHome} />
                대시보드
              </button>
            </Tooltip>
          </li>
          <li>
            <button
              class={css(
                {
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  borderRadius: '16px',
                  paddingX: '8px',
                  paddingY: '26px',
                  width: 'full',
                  _hover: {
                    color: 'gray.900',
                    backgroundColor: 'gray.50',
                  },
                },
                $page.url.pathname === `/${$query.space.slug}/dashboard/members` && {
                  color: 'gray.900',
                  backgroundColor: 'gray.50',
                },
              )}
              type="button"
              on:click={() => (comingSoonOpen = true)}
            >
              <Icon style={css.raw({ size: '20px' })} icon={IconUser} />
              멤버 관리
            </button>
          </li>
          <li>
            <a
              class={css(
                {
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  borderRadius: '16px',
                  paddingX: '8px',
                  paddingY: '26px',
                  width: 'full',
                  _hover: {
                    color: 'gray.900',
                    backgroundColor: 'gray.50',
                  },
                },
                $page.url.pathname === `/${$query.space.slug}/dashboard/posts` && {
                  color: 'gray.900',
                  backgroundColor: 'gray.50',
                },
              )}
              href="/{$query.space.slug}/dashboard/posts"
            >
              <Icon style={css.raw({ size: '20px' })} icon={IconFileText} />
              포스트 관리
            </a>
          </li>
          <li>
            <a
              class={css(
                {
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  borderRadius: '16px',
                  paddingX: '8px',
                  paddingY: '26px',
                  width: 'full',
                  _hover: {
                    color: 'gray.900',
                    backgroundColor: 'gray.50',
                  },
                },
                $page.url.pathname === `/${$query.space.slug}/dashboard/subscribers` && {
                  color: 'gray.900',
                  backgroundColor: 'gray.50',
                },
              )}
              href="/{$query.space.slug}/dashboard/subscribers/blocked"
            >
              <Icon style={css.raw({ size: '20px' })} icon={IconUsers} />
              독자 관리
            </a>
          </li>
          <li>
            <a
              class={css(
                {
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  borderRadius: '16px',
                  paddingX: '8px',
                  paddingY: '26px',
                  width: 'full',
                  _hover: {
                    color: 'gray.900',
                    backgroundColor: 'gray.50',
                  },
                },
                $page.url.pathname === `/${$query.space.slug}/dashboard/settings` && {
                  color: 'gray.900',
                  backgroundColor: 'gray.50',
                },
              )}
              href="/{$query.space.slug}/dashboard/settings"
            >
              <Icon style={css.raw({ size: '20px' })} icon={IconSettings} />
              스페이스 설정
            </a>
          </li>
        </ul>
      </nav>
    </div>
  </aside>

  <div
    class={css({ flex: '1', backgroundColor: 'gray.50', overflow: 'auto', sm: { paddingX: '44px', paddingY: '40px' } })}
  >
    <div class={css({ width: 'full', maxWidth: '872px' })}>
      <slot />
    </div>
  </div>
</main>

<Footer />

<BottomSheet bind:open>
  <div class={flex({ align: 'center', gap: '8px', width: 'full' })}>
    <Icon style={css.raw({ size: '24px', borderRadius: '8px' })} icon={IconEffit} />
    <span class={css({ fontWeight: 'bold' })}>스페이스 관리</span>
  </div>

  <div class={css({ borderBottomWidth: '1px', borderBottomColor: '[black/10]', marginY: '8px', width: 'full' })} />

  <div
    class={flex({
      justify: 'space-between',
      align: 'center',
      gap: '4px',
      borderRadius: '8px',
      marginBottom: '12px',
      paddingX: '12px',
      paddingY: '8px',
      backgroundColor: 'gray.50',
      truncate: true,
    })}
  >
    <div class={flex({ align: 'center', gap: '12px', width: 'full', truncate: true })}>
      <Image
        style={css.raw({
          flex: 'none',
          borderWidth: '1px',
          borderColor: 'gray.200',
          borderRadius: '12px',
          size: '48px',
        })}
        $image={$query.space.icon}
      />
      <div class={css({ truncate: true })}>
        <p class={css({ marginBottom: '4px', fontSize: '15px', fontWeight: 'bold', truncate: true })}>
          {$query.space.name}
        </p>
        <div class={flex({ align: 'center', gap: '4px', fontSize: '12px', fontWeight: 'medium', color: 'gray.500' })}>
          {#if $query.space.visibility === 'PUBLIC'}
            <div class={css({ borderRadius: 'full', size: '5px', backgroundColor: '[#4ECEA6]' })} />
            <span>공개중</span>
          {:else}
            <div class={css({ borderRadius: 'full', size: '5px', backgroundColor: 'gray.400' })} />
            <span>비공개중</span>
          {/if}
        </div>
      </div>
    </div>

    <a
      class={css({
        borderRadius: '[48px]',
        paddingX: '12px',
        paddingY: '6px',
        fontSize: '13px',
        fontWeight: 'medium',
        color: 'gray.50',
        textWrap: 'nowrap',
      })}
      href={`/editor?space=${$query.space.slug}`}
    >
      포스트 작성하기
    </a>
  </div>

  <div class={flex({ justify: 'space-between', align: 'center', gap: '4px', paddingX: '12px', paddingY: '10px' })}>
    {#if $query.space.meAsMember}
      <div class={flex({ align: 'center', truncate: true })}>
        <Avatar
          style={css.raw({ flex: 'none', marginRight: '12px', size: '24px' })}
          $profile={$query.space.meAsMember.profile}
        />
        <span class={css({ flexGrow: '1', fontSize: '14px', fontWeight: 'bold', truncate: true })}>
          {$query.space.meAsMember.profile.name}
        </span>
      </div>
      <button
        class={css({ fontSize: '12px', fontWeight: 'medium', color: 'gray.500', textWrap: 'nowrap' })}
        type="button"
        on:click={() => (updateSpaceProfileOpen = true)}
      >
        수정
      </button>
    {/if}
  </div>

  <div class={css({ borderBottomWidth: '1px', borderBottomColor: '[black/10]', marginY: '8px', width: 'full' })} />

  <nav class={css({ width: 'full' })}>
    <ul class={css({ fontWeight: 'bold', color: 'gray.500' })}>
      <li>
        <button
          class={css(
            {
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              borderRadius: '16px',
              paddingX: '8px',
              paddingY: '26px',
              _hover: {
                color: 'gray.950',
                backgroundColor: 'gray.50',
              },
            },
            $page.url.pathname === `/${$query.space.slug}/dashboard` && {
              color: 'gray.950',
              backgroundColor: 'gray.50',
            },
          )}
          type="button"
          on:click={() => (comingSoonOpen = true)}
        >
          <Icon style={css.raw({ size: '20px' })} icon={IconHome} />
          대시보드
        </button>
      </li>
      <li>
        <button
          class={css(
            {
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              borderRadius: '16px',
              paddingX: '8px',
              paddingY: '26px',
              _hover: {
                color: 'gray.950',
                backgroundColor: 'gray.50',
              },
            },
            $page.url.pathname === `/${$query.space.slug}/dashboard/members` && {
              color: 'gray.950',
              backgroundColor: 'gray.50',
            },
          )}
          type="button"
          on:click={() => (comingSoonOpen = true)}
        >
          <Icon style={css.raw({ size: '20px' })} icon={IconUser} />
          멤버 관리
        </button>
      </li>
      <li>
        <a
          class={css(
            {
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              borderRadius: '16px',
              paddingX: '8px',
              paddingY: '26px',
              _hover: {
                color: 'gray.950',
                backgroundColor: 'gray.50',
              },
            },
            $page.url.pathname === `/${$query.space.slug}/dashboard/posts` && {
              color: 'gray.950',
              backgroundColor: 'gray.50',
            },
          )}
          href="/{$query.space.slug}/dashboard/posts"
        >
          <Icon style={css.raw({ size: '20px' })} icon={IconFileText} />
          포스트 관리
        </a>
      </li>
      <li>
        <a
          class={css(
            {
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              borderRadius: '16px',
              paddingX: '8px',
              paddingY: '26px',
              _hover: {
                color: 'gray.950',
                backgroundColor: 'gray.50',
              },
            },
            $page.url.pathname === `/${$query.space.slug}/dashboard/subscribers` && {
              color: 'gray.950',
              backgroundColor: 'gray.50',
            },
          )}
          href="/{$query.space.slug}/dashboard/subscribers/blocked"
        >
          <Icon style={css.raw({ size: '20px' })} icon={IconUsers} />
          독자 관리
        </a>
      </li>
      <li>
        <a
          class={css(
            {
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              borderRadius: '16px',
              paddingX: '8px',
              paddingY: '26px',
              _hover: {
                color: 'gray.950',
                backgroundColor: 'gray.50',
              },
            },
            $page.url.pathname === `/${$query.space.slug}/dashboard/settings` && {
              color: 'gray.950',
              backgroundColor: 'gray.50',
            },
          )}
          href="/{$query.space.slug}/dashboard/settings"
        >
          <Icon style={css.raw({ size: '20px' })} icon={IconSettings} />
          스페이스 설정
        </a>
      </li>
    </ul>
  </nav>
</BottomSheet>

<UpdateSpaceProfileModal {$query} bind:open={updateSpaceProfileOpen} />
<ComingSoonModal bind:open={comingSoonOpen} />
