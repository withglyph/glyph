<script lang="ts">
  import clsx from 'clsx';
  import Wordmark from '$assets/icons/wordmark.svg?component';
  import { graphql } from '$glitch';
  import { Logo } from '$lib/components/branding';
  import Post from '../../../(default)/[space]/Post.svelte';
  import Footer from '../../../(default)/Footer.svelte';

  let mode: 'desktop' | 'mobile' = 'desktop';

  import { page } from '$app/stores';

  $: hideHeader = $page.url.searchParams.get('hideHeader') === 'true';

  $: query = graphql(`
    query EditorPermalinkPreviewPage_Query($permalink: String!, $revisionId: ID) {
      post(permalink: $permalink) {
        id

        draftRevision(revisionId: $revisionId) @_required {
          id
          ...Post_postRevision
        }
      }

      ...Post_query
    }
  `);
</script>

{#if !hideHeader}
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
{/if}

<main class="flex grow items-start justify-center m-auto w-full bg-primary">
  <Post
    class={clsx(
      mode === 'mobile' && 'max-w-100 py-17!',
      mode === 'desktop' && 'max-w-262 py-7.5! border-l border-r border-secondary',
    )}
    $postRevision={$query.post.draftRevision}
    {$query}
    preview
  />
</main>

<Footer />
