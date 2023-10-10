<script lang="ts">
  import clsx from 'clsx';
  import { page } from '$app/stores';
  import PencilUnderline from '$assets/icons/pencil-underline.svg?component';
  import { graphql } from '$glitch';
  import { Avatar, Button } from '$lib/components';
  import UpdateProfileModal from './settings/UpdateProfileModal.svelte';

  let open = false;

  $: query = graphql(`
    query MeLayout_Query {
      auth(scope: USER)

      me @_required {
        id
        email

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

<div class="w-full max-w-300 flex flex-col sm:m-7.5">
  <h1 class="text-xl font-bold mb-5 <sm:hidden">나의 펜슬</h1>
  <div class="sm:(flex gap-10)">
    <aside
      class={clsx(
        'w-81.5 bg-cardprimary border border-secondary rounded-2xl px-4 py-10 h-full <sm:hidden',
        $page.url.pathname === '/me' && 'block! border-bg-cardprimary w-full max-w-screen rounded-0!',
      )}
    >
      <div class="flex flex-col items-center gap-4 mb-6">
        <div class="flex center border border-primary rounded-full square-21">
          <Avatar class="square-20" $profile={$query.me.profile} />
        </div>
        <div class="text-center">
          <p class="text-xl font-bold mb-2">{$query.me.profile.name}</p>
          <p class="font-semibold text-secondary">{$query.me.email}</p>
        </div>
        <div class="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-surface-primary rounded-2.5">
          <span class="font-bold">1000P</span>
          <Button size="md">충전하기</Button>
        </div>
        <Button
          class="w-full font-bold text-sm"
          color="tertiary"
          size="lg"
          variant="outlined"
          on:click={() => (open = true)}
        >
          <PencilUnderline class="square-5 mr-2" />
          프로필 수정
        </Button>
      </div>

      <nav>
        <ul>
          <li>
            <a
              class={clsx(
                'flex items-center w-full inline-block p-3 h-15 font-bold rounded-1.5 transition hover:bg-primary text-disabled',
                $page.url.pathname === '/me/cabinets' && 'bg-primary text-primary',
              )}
              href="/me/cabinets"
            >
              나의 서랍
            </a>
          </li>
          <li>
            <a
              class={clsx(
                'flex items-center w-full inline-block p-3 h-15 font-bold rounded-1.5 transition hover:bg-primary text-disabled',
                $page.url.pathname === '/me/dashboard' && 'bg-primary text-primary',
              )}
              href="/me/dashboard"
            >
              대시보드
            </a>
          </li>
          <li>
            <a
              class={clsx(
                'flex items-center w-full inline-block p-3 h-15 font-bold rounded-1.5 transition hover:bg-primary text-disabled',
                $page.url.pathname === '/me/posts' && 'bg-primary text-primary',
              )}
              href="/me/posts"
            >
              포스트 관리
            </a>
          </li>
          <li>
            <a
              class={clsx(
                'flex items-center w-full inline-block p-3 h-15 font-bold rounded-1.5 transition hover:bg-primary text-disabled',
                $page.url.pathname === '/me/comments' && 'bg-primary text-primary',
              )}
              href="/me/comments"
            >
              댓글 관리
            </a>
          </li>
          <li>
            <a
              class={clsx(
                'flex items-center w-full inline-block p-3 h-15 font-bold rounded-1.5 transition hover:bg-primary text-disabled',
                $page.url.pathname === '/me/revenue' && 'bg-primary text-primary',
              )}
              href="/me/revenue"
            >
              정산/수익
            </a>
          </li>
          <li>
            <a
              class={clsx(
                'flex items-center w-full inline-block p-3 h-15 font-bold rounded-1.5 transition hover:bg-primary text-disabled',
                $page.url.pathname.startsWith('/me/settings') && 'bg-primary text-primary',
              )}
              href="/me/settings"
            >
              설정
            </a>
          </li>
        </ul>
      </nav>
    </aside>

    <div class="w-full max-w-208">
      <slot />
    </div>
  </div>
</div>

<UpdateProfileModal $profile={$query.me.profile} bind:open />
