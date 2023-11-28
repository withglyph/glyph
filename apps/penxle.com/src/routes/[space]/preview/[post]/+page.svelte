<script lang="ts">
  import clsx from 'clsx';
  import dayjs from 'dayjs';
  import Wordmark from '$assets/icons/wordmark.svg?component';
  import { graphql } from '$glitch';
  import { Avatar, Button, Image, Tag } from '$lib/components';
  import { Logo } from '$lib/components/branding';
  import { BaseLayout } from '$lib/layouts';
  import { TiptapRenderer } from '$lib/tiptap/components';

  let mode: 'desktop' | 'mobile' = 'desktop';

  $: query = graphql(`
    query SpacePreviewPostPage_Query($permalink: String!) {
      ...BaseLayout_query

      post(permalink: $permalink) {
        id
        permalink

        space {
          id
          name
          description

          icon {
            id
            ...Image_image
          }
        }

        member {
          id

          profile {
            id
            name
            ...Avatar_profile
          }
        }

        draftRevision {
          id
          title
          subtitle
          content
          createdAt
        }

        tags {
          id
          pinned

          tag {
            id
            name
          }
        }
      }
    }
  `);
</script>

<BaseLayout {$query}>
  <header class="relative sticky top-0 z-10 border-b border-secondary bg-white px-4 py-2 sm:px-7.5 h-15.25 flex center">
    <nav class="w-full max-w-300">
      <section class="flex items-center justify-between relative">
        <div class="mr-3.5 flex items-center gap-2 sm:mr-4 transition w-fit absolute left-0">
          <Logo class="<sm:square-7.5 sm:square-6" />
          <Wordmark class="<sm:hidden h-5.25" />
        </div>

        <div class="grow flex center">
          <div
            class={clsx(
              "bg-surface-primary rounded-2.5 h-10 w-fit grid relative grid-cols-2 before:(content-[''] absolute w-50% h-100% left-0 bg-cardprimary border border-secondary rounded-2.5 transition-all)",
              mode === 'mobile' && 'before:left-50%',
            )}
          >
            <button
              class={clsx(
                'h-10 py-2 px-4 flex items-center gap-2 z-1',
                mode === 'desktop' &&
                  'first:(text-icon-primary transition-color) last:(text-icon-secondary transition-color)',
                mode === 'mobile' &&
                  'first:(text-icon-secondary transition-color) last:(text-icon-primary transition-color)',
              )}
              type="button"
              on:click={() => {
                mode = 'desktop';
              }}
            >
              <i class="i-lc-monitor square-5" />
            </button>
            <button
              class={clsx(
                'h-10 py-2 px-4 flex items-center gap-2 z-1',
                mode === 'desktop' && 'first:(text-icon-primary transition) last:(text-icon-secondary transition)',
                mode === 'mobile' && 'first:(text-icon-secondary transition) last:(text-icon-primary transition)',
              )}
              type="button"
              on:click={() => {
                mode = 'mobile';
              }}
            >
              <i class="i-lc-smartphone square-5" />
            </button>
          </div>
        </div>
      </section>
    </nav>
  </header>

  <main class="flex grow items-start justify-center m-auto w-full bg-primary">
    <article
      class={clsx(
        'bg-cardprimary px-4 w-full',
        mode === 'mobile' && 'max-w-100 py-17',
        mode === 'desktop' && 'max-w-262 py-7.5 border-l border-r border-secondary',
      )}
    >
      <div class="w-full max-w-187.5 mx-auto space-y-6">
        <header>
          <hgroup class="space-y-4">
            <h1 class="title-24-eb break-all sm:title-32-eb">{$query.post.draftRevision.title}</h1>
            {#if $query.post.draftRevision.subtitle}
              <p class="body-16-sb text-secondary break-all sm:subtitle-18-sb">{$query.post.draftRevision.subtitle}</p>
            {/if}
          </hgroup>

          <div class="border-b border-secondary w-full flex flex-col mt-4.75 sm:mt-6">
            <div class="flex items-center pt-4 pb-5 gap-3">
              <div class="relative">
                <Image class="square-10.5 rounded-3.5" $image={$query.post.space.icon} />
                <Avatar
                  class="square-6 absolute border border-bg-primary -right-1 -bottom-1"
                  $profile={$query.post.member.profile}
                />
              </div>
              <div class="grow-1">
                <p class="body-15-b">{$query.post.space.name} · {$query.post.member.profile.name}</p>
                <div class="flex items-center gap-3.5 body-13-m text-secondary">
                  <span>{dayjs($query.post.draftRevision.createdAt).formatAsDate()}</span>
                  <span class="flex items-center gap-1">
                    <i class="i-lc-eye square-3.75" />
                    0
                  </span>
                  <span class="flex items-center gap-1">
                    <i class="i-px-heart square-3.75" />
                    0
                  </span>
                  <span class="flex items-center gap-1">
                    <i class="i-lc-alarm-clock square-3.75" />
                    1분
                  </span>
                </div>
              </div>

              <button class="i-lc-bookmark square-6" type="button" />
              <button class="i-lc-share square-6" type="button" />
              <button class="i-lc-more-vertical square-6 text-icon-secondary" type="button" />
            </div>
          </div>
        </header>

        <div class="relative">
          <article class="min-h-11rem">
            <TiptapRenderer class="bodylong-16-m" content={$query.post.draftRevision.content} />
          </article>
        </div>

        <hr class="w-full border-color-alphagray-10" />

        <div class="flex gap-2 flex-wrap">
          {#each $query.post.tags as { tag } (tag.id)}
            <Tag size="sm">
              #{tag.name}
            </Tag>
          {/each}
          <Button class="rounded-12! px-4!" color="tertiary" size="sm" variant="outlined">
            <i class="i-lc-plus square-4" />
          </Button>
        </div>

        <button
          class="square-6 rounded-lg border border-secondary hover:border-primary flex center p-0.5 mt-4!"
          type="button"
        >
          <i class="i-lc-smile-plus square-3.5" />
        </button>

        <div class="flex items-center justify-between py-2">
          <Button class="rounded-12! px-3! h-6!" color="tertiary" size="sm" variant="outlined">
            <i class="i-px-heart square-4 mr-1" />

            <span class="body-15-b">0</span>
          </Button>

          <div>
            <button class="i-lc-bookmark square-6 mr-3" type="button" />
            <button class="i-lc-share square-6" type="button" />
          </div>
        </div>

        <div class="bg-primary rounded-3xl">
          <div class="flex flex-col w-full center px-4 pb-4 mt-9">
            <Image class="square-15 rounded-2xl -mt-7.5" $image={$query.post.space.icon} />
            <p class="subtitle-18-eb mt-4 truncate w-full text-center">
              {$query.post.space.name}
            </p>
            <p class="body-15-sb text-secondary my-2 truncate text-center w-full">
              {$query.post.space.description ?? '아직 소개가 없어요'}
            </p>
          </div>
          <div />
        </div>
      </div>
    </article>
  </main>
</BaseLayout>
