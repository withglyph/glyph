<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import IconArchive from '~icons/tabler/archive';
  import IconBulb from '~icons/tabler/bulb';
  import IconCaretDownFilled from '~icons/tabler/caret-down-filled';
  import IconCaretUpFilled from '~icons/tabler/caret-up-filled';
  import IconCoin from '~icons/tabler/coin';
  import IconLogout from '~icons/tabler/logout';
  import IconPencil from '~icons/tabler/pencil';
  import IconPigMoney from '~icons/tabler/pig-money';
  import IconPlanet from '~icons/tabler/planet';
  import IconPlus from '~icons/tabler/plus';
  import { afterNavigate, goto } from '$app/navigation';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Avatar, Button, Icon, Image, Link } from '$lib/components';
  import { portal, scrollLock } from '$lib/svelte/actions';
  import { css } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';
  import CreateSpaceModal from './CreateSpaceModal.svelte';
  import type { DefaultLayout_UserMenu_user } from '$glitch';

  let _user: DefaultLayout_UserMenu_user;
  export { _user as $user };

  let open = false;
  let spaceListOpen = true;
  let createSpaceOpen = false;

  $: user = fragment(
    _user,
    graphql(`
      fragment DefaultLayout_UserMenu_user on User {
        id
        email

        profile {
          id
          name
          ...Avatar_profile
        }

        spaces {
          id
          slug
          name

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

        ...CreateSpaceModal_user
      }
    `),
  );

  const createPost = graphql(`
    mutation DefaultLayout_UserMenuCreatePost_Mutation($input: CreatePostInput!) {
      createPost(input: $input) {
        id
        permalink
      }
    }
  `);

  const logoutUser = graphql(`
    mutation DefaultLayout_UserMenu_LogoutUser_Mutation {
      logoutUser
    }
  `);

  afterNavigate(() => {
    open = false;
  });
</script>

<button
  class={center({ borderRadius: 'full', outlineWidth: '1px', outlineColor: 'gray.200' })}
  tabindex="-1"
  type="button"
  on:click={() => (open = true)}
>
  <Avatar style={css.raw({ size: '32px' })} $profile={$user.profile} size={32} />
</button>

{#if open}
  <div class={css({ position: 'fixed', inset: '0', zIndex: '50' })} use:portal>
    <div
      class={css({
        position: 'absolute',
        inset: '0',
        backgroundColor: 'gray.900/50',
        backdropFilter: 'auto',
        backdropBlur: '8px',
      })}
      role="button"
      tabindex="-1"
      on:click={() => (open = false)}
      on:keypress={null}
      transition:fade={{ duration: 150 }}
    />

    <div
      class={flex({
        justify: 'flex-end',
        position: 'absolute',
        top: '0',
        bottom: '0',
        right: '0',
        width: { base: '312px', sm: '420px' },
        pointerEvents: 'none',
      })}
      use:scrollLock
    >
      <div
        class={flex({
          direction: 'column',
          width: 'full',
          maxHeight: 'full',
          backgroundColor: 'gray.0',
          boxShadow: '[0px 6px 24px 0px {colors.gray.900/8}]',
          pointerEvents: 'auto',
        })}
        data-scroll-lock-ignore
        in:fly={{ x: '10%', duration: 150 }}
        out:fade={{ duration: 150 }}
      >
        <nav class={css({ overflowX: 'hidden', paddingBottom: '120px' })}>
          {#if $user}
            <div
              class={flex({
                justify: 'space-between',
                align: 'center',
                gap: '26px',
                borderBottomWidth: '1px',
                borderBottomColor: 'gray.100',
                padding: '14px',
              })}
            >
              <a class={flex({ align: 'center', gap: '6px', truncate: true })} href="/me/cabinets">
                <Avatar
                  style={css.raw({ borderWidth: '[0.8px]', borderColor: 'gray.100', size: '36px' })}
                  $profile={$user.profile}
                  size={48}
                />
                <div class={css({ truncate: true })}>
                  <p class={css({ fontSize: '14px', truncate: true })}>
                    <span class={css({ truncate: true })}>{$user.profile.name}</span>
                    <span>님</span>
                  </p>
                  <p class={css({ fontSize: '12px', color: 'gray.600' })}>{$user.email}</p>
                </div>
              </a>

              <Button
                style={css.raw({ whiteSpace: 'nowrap', flex: 'none' })}
                href="/me/settings"
                size="sm"
                type="link"
                variant="gray-outline"
              >
                계정 설정
              </Button>
            </div>

            <button
              class={flex({
                justify: 'space-between',
                align: 'center',
                borderBottomWidth: '1px',
                borderBottomColor: spaceListOpen ? 'gray.150' : 'gray.100',
                padding: '14px',
                fontSize: '14px',
                width: 'full',
              })}
              type="button"
              on:click={() => {
                spaceListOpen = !spaceListOpen;
              }}
            >
              <p class={flex({ align: 'center', gap: '6px' })}><Icon icon={IconPlanet} /> 내 스페이스</p>

              {#if spaceListOpen}
                <Icon style={css.raw({ color: 'gray.400' })} icon={IconCaretUpFilled} />
              {:else}
                <Icon style={css.raw({ color: 'gray.400' })} icon={IconCaretDownFilled} />
              {/if}
            </button>

            {#if spaceListOpen}
              <ul>
                {#each $user.spaces as space (space.id)}
                  <li
                    class={flex({
                      justify: 'space-between',
                      align: 'center',
                      gap: '40px',
                      borderBottomWidth: '1px',
                      borderBottomColor: 'gray.150',
                      padding: '14px',
                      paddingRight: '0',
                      backgroundColor: { base: 'gray.50', _hover: 'gray.100' },
                      transition: 'common',
                    })}
                  >
                    <a
                      class={flex({ align: 'center', gap: '12px', flexGrow: '1', truncate: true })}
                      href="/{space.slug}"
                    >
                      <div class={css({ position: 'relative', flex: 'none' })}>
                        <Image
                          style={css.raw({
                            flex: 'none',
                            borderWidth: '[0.8px]',
                            borderColor: 'gray.100',
                            size: '28px',
                          })}
                          $image={space.icon}
                          size={32}
                        />
                        <Avatar
                          style={css.raw({
                            position: 'absolute',
                            right: '-6px',
                            bottom: '-4px',
                            borderWidth: '[0.8px]',
                            borderColor: 'gray.100',
                            size: '20px',
                          })}
                          $profile={space.meAsMember.profile}
                          size={24}
                        />
                      </div>

                      <div class={css({ truncate: true })}>
                        <p class={css({ fontSize: '14px', truncate: true })}>
                          {space.name}
                        </p>
                        <p class={css({ fontSize: '12px', color: 'gray.500', truncate: true })}>
                          <span class={css({ fontSize: '11px' })}>by</span>
                          {space.meAsMember.profile.name}
                        </p>
                      </div>
                    </a>

                    <button
                      class={center({ flex: 'none', size: '40px', paddingX: '12px' })}
                      type="button"
                      on:click={async () => {
                        const { permalink } = await createPost({ spaceId: space.id });
                        mixpanel.track('post:create', { via: 'user-menu' });
                        await goto(`/editor/${permalink}`);
                      }}
                    >
                      <Icon style={css.raw({ color: 'gray.500', size: '20px' })} icon={IconPencil} />
                    </button>
                  </li>
                {/each}

                <li
                  class={css({ borderBottomWidth: '1px', borderBottomColor: 'gray.150', backgroundColor: 'gray.100' })}
                >
                  <button
                    class={flex({
                      align: 'center',
                      gap: '4px',
                      padding: '14px',
                      fontSize: '14px',
                      color: 'gray.500',
                      width: 'full',
                    })}
                    type="button"
                    on:click={() => (createSpaceOpen = true)}
                  >
                    <Icon icon={IconPlus} />
                    스페이스 만들기
                  </button>
                </li>
              </ul>
            {/if}

            <a
              class={flex({
                align: 'center',
                gap: '6px',
                borderBottomWidth: '1px',
                borderBottomColor: 'gray.100',
                padding: '14px',
                fontSize: '14px',
                width: 'full',
              })}
              href="/me/cabinets"
            >
              <Icon icon={IconArchive} />
              보관함
            </a>

            <a
              class={flex({
                align: 'center',
                gap: '6px',
                borderBottomWidth: '1px',
                borderBottomColor: 'gray.100',
                padding: '14px',
                fontSize: '14px',
                width: 'full',
              })}
              href="/me/point"
            >
              <Icon icon={IconCoin} />
              포인트
            </a>
            <a
              class={flex({
                align: 'center',
                gap: '6px',
                borderBottomWidth: '1px',
                borderBottomColor: 'gray.100',
                padding: '14px',
                fontSize: '14px',
                width: 'full',
              })}
              href="/me/revenue"
            >
              <Icon icon={IconPigMoney} />
              수익/출금
            </a>

            <Link
              style={flex.raw({
                align: 'center',
                gap: '6px',
                borderBottomWidth: '1px',
                borderBottomColor: 'gray.100',
                padding: '14px',
                fontSize: '14px',
                width: 'full',
              })}
              href="https://penxle.nolt.io"
            >
              <Icon icon={IconBulb} />
              글리프 피드백하기
            </Link>

            <button
              class={flex({
                align: 'center',
                gap: '6px',
                padding: '14px',
                width: 'full',
                fontSize: '14px',
                textAlign: 'left',
              })}
              type="button"
              on:click={async () => {
                await logoutUser();
                mixpanel.track('user:logout');
                mixpanel.reset();
                location.href = '/';
              }}
            >
              <Icon icon={IconLogout} />
              로그아웃
            </button>
          {/if}
        </nav>
      </div>
    </div>
  </div>
{/if}

<CreateSpaceModal {$user} bind:open={createSpaceOpen} />
