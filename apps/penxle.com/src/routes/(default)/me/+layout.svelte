<script lang="ts">
  import { page } from '$app/stores';
  import PencilUnderline from '$assets/icons/pencil-underline.svg?component';
  import { graphql } from '$glitch';
  import { Avatar, Button } from '$lib/components';
  import { comma } from '$lib/utils';
  import { css } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';
  import ComingSoonModal from '../ComingSoonModal.svelte';
  import UpdateProfileModal from './settings/UpdateProfileModal.svelte';

  let open = false;
  let comingSoonOpen = false;

  $: query = graphql(`
    query MeLayout_Query {
      auth(scope: USER)

      me @_required {
        id
        email
        point

        profile {
          id
          name

          ...Avatar_profile
          ...MeSettingsPage_UpdateProfileModal_profile
        }
      }
    }
  `);
</script>

<div class={flex({ flexDirection: 'column', grow: '1', width: 'full', maxWidth: '1260px', sm: { padding: '30px' } })}>
  <h1 class={css({ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', hideBelow: 'sm' })}>나의 펜슬</h1>
  <div class={css({ sm: { display: 'flex', gap: '40px' } })}>
    <aside
      class={css(
        {
          borderWidth: '1px',
          borderColor: 'gray.200',
          borderRadius: '16px',
          paddingX: '16px',
          paddingY: '40px',
          backgroundColor: 'white',
          width: '326px',
          height: 'full',
          hideBelow: 'sm',
        },
        $page.url.pathname === '/me' && {
          display: 'block',
          borderColor: 'white',
          borderRadius: '0',
          width: 'full',
          maxWidth: 'screen',
        },
      )}
    >
      <div class={flex({ flexDirection: 'column', align: 'center', gap: '16px', marginBottom: '24px' })}>
        <div class={center({ borderWidth: '1px', borderColor: 'gray.200', borderRadius: 'full', size: '84px' })}>
          <Avatar style={css.raw({ size: '80px' })} $profile={$query.me.profile} />
        </div>
        <div class={css({ textAlign: 'center' })}>
          <p class={css({ marginBottom: '8px', fontSize: '20px', fontWeight: 'bold' })}>{$query.me.profile.name}</p>
          <p class={css({ fontWeight: 'semibold', color: 'gray.500' })}>{$query.me.email}</p>
        </div>
        <div
          class={flex({
            align: 'center',
            justify: 'space-between',
            gap: '8px',
            borderRadius: '10px',
            paddingX: '12px',
            paddingY: '10px',
            backgroundColor: 'gray.100',
            width: 'full',
          })}
        >
          <a class={css({ flexGrow: '1', fontWeight: 'bold' })} href="/point">{comma($query.me.point)}P</a>
          <Button href="/point/purchase" size="md" type="link">충전하기</Button>
        </div>
        <Button
          style={css.raw({ fontSize: '14px', fontWeight: 'bold', width: 'full' })}
          color="tertiary"
          size="lg"
          variant="outlined"
          on:click={() => (open = true)}
        >
          <PencilUnderline class={css({ marginRight: '8px', size: '20px' })} />
          프로필 수정
        </Button>
      </div>

      <nav>
        <ul class={flex({ flexDirection: 'column', gap: '4px' })}>
          <li>
            <a
              class={css(
                {
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '6px',
                  padding: '12px',
                  fontWeight: 'bold',
                  color: 'gray.400',
                  width: 'full',
                  height: '60px',
                  transition: 'common',
                  _hover: {
                    backgroundColor: 'gray.50',
                  },
                },
                $page.url.pathname.startsWith('/me/cabinets') && { backgroundColor: 'gray.50', color: 'gray.950' },
              )}
              href="/me/cabinets"
            >
              나의 서랍
            </a>
          </li>
          <li>
            <button
              class={css(
                {
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '6px',
                  padding: '12px',
                  fontWeight: 'bold',
                  color: 'gray.400',
                  width: 'full',
                  height: '60px',
                  transition: 'common',
                  _hover: {
                    backgroundColor: 'gray.50',
                  },
                },
                $page.url.pathname === '/me/dashboard' && { backgroundColor: 'gray.50', color: 'gray.950' },
              )}
              type="button"
              on:click={() => (comingSoonOpen = true)}
            >
              대시보드
            </button>
          </li>
          <li>
            <a
              class={css(
                {
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '6px',
                  padding: '12px',
                  fontWeight: 'bold',
                  color: 'gray.400',
                  width: 'full',
                  height: '60px',
                  transition: 'common',
                  _hover: {
                    backgroundColor: 'gray.50',
                  },
                },
                $page.url.pathname === '/me/posts' && { backgroundColor: 'gray.50', color: 'gray.950' },
              )}
              href="/me/posts"
            >
              포스트 관리
            </a>
          </li>
          <li>
            <a
              class={css(
                {
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '6px',
                  padding: '12px',
                  fontWeight: 'bold',
                  color: 'gray.400',
                  width: 'full',
                  height: '60px',
                  transition: 'common',
                  _hover: {
                    backgroundColor: 'gray.50',
                  },
                },
                $page.url.pathname.startsWith('/me/revenue') && { backgroundColor: 'gray.50', color: 'gray.950' },
              )}
              href="/me/revenue"
            >
              수익/정산
            </a>
          </li>
          <li>
            <a
              class={css(
                {
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '6px',
                  padding: '12px',
                  fontWeight: 'bold',
                  color: 'gray.400',
                  width: 'full',
                  height: '60px',
                  transition: 'common',
                  _hover: {
                    backgroundColor: 'gray.50',
                  },
                },
                $page.url.pathname.startsWith('/me/settings') && { backgroundColor: 'gray.50', color: 'gray.950' },
              )}
              href="/me/settings"
            >
              설정
            </a>
          </li>
        </ul>
      </nav>
    </aside>

    <div class={css({ width: 'full', maxWidth: '832px', overflow: 'auto' })}>
      <slot />
    </div>
  </div>
</div>

<UpdateProfileModal $profile={$query.me.profile} bind:open />
<ComingSoonModal bind:open={comingSoonOpen} />
