<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import IconChevronDown from '~icons/tabler/chevron-down';
  import IconChevronUp from '~icons/tabler/chevron-up';
  import IconPencil from '~icons/tabler/pencil';
  import IconPlus from '~icons/tabler/plus';
  import { afterNavigate, goto } from '$app/navigation';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Avatar, Icon, Image, Link } from '$lib/components';
  import { Button } from '$lib/components/v2';
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
  <Avatar style={css.raw({ size: { base: '34px', sm: '36px' } })} $profile={$user.profile} />
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
        width: { base: '294px', sm: '320px' },
        pointerEvents: 'none',
      })}
    >
      <div
        class={flex({
          direction: 'column',
          borderTopLeftRadius: '12px',
          width: 'full',
          maxHeight: 'full',
          backgroundColor: 'gray.5',
          boxShadow: '[0px 6px 24px 0px {colors.gray.900/8}]',
          pointerEvents: 'auto',
        })}
        use:scrollLock
        in:fly={{ x: '10%', duration: 150 }}
        out:fade={{ duration: 150 }}
      >
        <div class={css({ overflowX: 'hidden' })}>
          {#if $user}
            <div
              class={flex({
                justify: 'space-between',
                align: 'center',
                gap: '26px',
                borderBottomWidth: '1px',
                borderBottomColor: 'gray.100',
                paddingX: '16px',
                paddingY: '18px',
              })}
            >
              <a class={flex({ align: 'center', gap: '6px' })} href="/me/cabinets">
                <Avatar
                  style={css.raw({ borderWidth: '1px', borderColor: 'gray.100', size: '36px' })}
                  $profile={$user.profile}
                />
                <div class={css({ truncate: true })}>
                  <p class={css({ fontSize: '14px', fontWeight: 'medium', truncate: true })}>
                    <span class={css({ truncate: true })}>{$user.profile.name}</span>
                    <span>님</span>
                  </p>
                  <p class={css({ fontSize: '10px', color: 'gray.500' })}>{$user.email}</p>
                </div>
              </a>

              <Button
                style={css.raw({ whiteSpace: 'nowrap', hideFrom: 'sm' })}
                href="/me"
                size="xs"
                type="link"
                variant="outline"
              >
                계정 설정
              </Button>
              <Button
                style={css.raw({ whiteSpace: 'nowrap', hideBelow: 'sm' })}
                href="/me/settings"
                size="sm"
                type="link"
                variant="outline"
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
                padding: '16px',
                paddingRight: '14px',
                width: 'full',
              })}
              type="button"
              on:click={() => {
                spaceListOpen = !spaceListOpen;
              }}
            >
              <p class={css({ fontSize: '14px', fontWeight: 'medium', color: 'gray.800' })}>나의 스페이스</p>

              {#if spaceListOpen}
                <Icon style={css.raw({ color: 'gray.400' })} icon={IconChevronUp} size={20} />
              {:else}
                <Icon style={css.raw({ color: 'gray.400' })} icon={IconChevronDown} size={20} />
              {/if}
            </button>

            {#if spaceListOpen}
              <ul>
                {#each $user.spaces as space (space.id)}
                  <li
                    class={flex({
                      justify: 'space-between',
                      align: 'center',
                      gap: '6px',
                      borderBottomWidth: '1px',
                      borderBottomColor: 'gray.150',
                      paddingX: '16px',
                      paddingY: '12px',
                      backgroundColor: 'gray.50',
                    })}
                  >
                    <a class={flex({ align: 'center', gap: '12px', truncate: true })} href="/{space.slug}">
                      <div class={css({ position: 'relative', flex: 'none' })}>
                        <Image
                          style={css.raw({
                            flex: 'none',
                            borderWidth: '1px',
                            borderColor: 'gray.150',
                            borderRadius: '4px',
                            size: '26px',
                          })}
                          $image={space.icon}
                        />
                        <Avatar
                          style={css.raw({ position: 'absolute', right: '-6px', bottom: '-4px', size: '18px' })}
                          $profile={space.meAsMember.profile}
                        />
                      </div>

                      <div class={css({ truncate: true })}>
                        <p class={css({ fontSize: '12px', fontWeight: 'medium', color: 'gray.800', truncate: true })}>
                          {space.name}
                        </p>
                        <p class={css({ fontSize: '12px', color: 'gray.500', truncate: true })}>
                          <span class={css({ fontSize: '11px' })}>by</span>
                          {space.meAsMember.profile.name}
                        </p>
                      </div>
                    </a>

                    <button
                      type="button"
                      on:click={async () => {
                        const { permalink } = await createPost({ spaceId: space.id });
                        mixpanel.track('post:create', { via: 'user-menu' });
                        await goto(`/editor/${permalink}`);
                      }}
                    >
                      <Icon style={css.raw({ color: 'gray.500' })} icon={IconPencil} size={20} />
                    </button>
                  </li>
                {/each}

                <li
                  class={css({ borderBottomWidth: '1px', borderBottomColor: 'gray.150', backgroundColor: 'gray.100' })}
                >
                  <button
                    class={flex({
                      align: 'center',
                      gap: '6px',
                      padding: '16px',
                      fontSize: '14px',
                      fontWeight: 'medium',
                      color: 'gray.500',
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
              class={css({
                display: 'inline-block',
                borderBottomWidth: '1px',
                borderBottomColor: 'gray.100',
                padding: '16px',
                width: 'full',
                fontSize: '14px',
                fontWeight: 'medium',
                color: 'gray.800',
              })}
              href="/point"
            >
              포인트
            </a>

            <Link
              style={css.raw({
                display: 'inline-block',
                borderBottomWidth: '1px',
                borderBottomColor: 'gray.100',
                padding: '16px',
                width: 'full',
                fontSize: '14px',
                fontWeight: 'medium',
                color: 'gray.800',
              })}
              href="https://penxle.nolt.io"
            >
              펜슬 피드백하기
            </Link>

            <button
              class={css({
                padding: '16px',
                width: 'full',
                fontSize: '14px',
                fontWeight: 'medium',
                color: 'gray.800',
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
              로그아웃
            </button>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

<CreateSpaceModal {$user} bind:open={createSpaceOpen} />
