<script lang="ts">
  import { page } from '$app/stores';
  import { graphql } from '$glitch';
  import { css } from '$styled-system/css';

  $: query = graphql(`
    query FeedLayout_Query {
      me {
        id
      }

      recentlyUsedTags {
        id
        name
      }
    }
  `);
</script>

<div class={css({ flexGrow: '1', paddingX: '16px', paddingY: '32px', width: 'full', backgroundColor: 'gray.5' })}>
  <div
    class={css({
      display: 'flex',
      gap: '32px',
      marginX: 'auto',
      paddingBottom: '16px',
      width: 'full',
      maxWidth: '1200px',
    })}
  >
    <div class={css({ flexGrow: '1', sm: { paddingRight: '100px' } })}>
      <div class={css({ display: 'flex', gap: '16px', fontSize: '18px', fontWeight: 'semibold' })}>
        <a
          class={css(
            $page.url.pathname === '/'
              ? { textDecorationLine: 'underline', textDecorationThickness: '4px', textUnderlineOffset: '8px' }
              : { color: { base: 'gray.300', _hover: '[inherit]' } },
          )}
          href="/"
        >
          추천
        </a>
        <a
          class={css(
            $page.url.pathname === '/feed/recent'
              ? { textDecorationLine: 'underline', textDecorationThickness: '4px', textUnderlineOffset: '8px' }
              : { color: { base: 'gray.300', _hover: '[inherit]' } },
          )}
          href="/feed/recent"
        >
          최신
        </a>
        {#if $query.me}
          <a
            class={css(
              $page.url.pathname === '/feed/tags'
                ? { textDecorationLine: 'underline', textDecorationThickness: '4px', textUnderlineOffset: '8px' }
                : { color: { base: 'gray.300', _hover: '[inherit]' } },
            )}
            href="/feed/tags"
          >
            관심 태그
          </a>
          <a
            class={css(
              $page.url.pathname === '/feed/spaces'
                ? { textDecorationLine: 'underline', textDecorationThickness: '4px', textUnderlineOffset: '8px' }
                : { color: { base: 'gray.300', _hover: '[inherit]' } },
            )}
            href="/feed/spaces"
          >
            관심 스페이스
          </a>
        {/if}
      </div>

      <slot />
    </div>

    <div class={css({ flex: 'none', width: '1px', backgroundColor: 'gray.200', hideBelow: 'sm' })} />

    <div
      class={css({
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
        flex: 'none',
        width: '300px',
        hideBelow: 'sm',
      })}
    >
      <div class={css({ position: 'sticky', top: '100px' })}>
        <div class={css({ display: 'flex', flexDirection: 'column', gap: '8px' })}>
          <div class={css({ fontSize: '18px', fontWeight: 'bold' })}>최근 사용된 태그</div>
          <div class={css({ display: 'flex', alignItems: 'flex-start', gap: '8px', flexWrap: 'wrap' })}>
            {#each $query.recentlyUsedTags as tag (tag.id)}
              <a
                class={css({
                  borderRadius: 'full',
                  paddingX: '12px',
                  paddingY: '4px',
                  fontSize: '12px',
                  color: 'gray.800',
                  backgroundColor: 'gray.100',
                })}
                href={`/tag/${tag.name}/post`}
              >
                #{tag.name}
              </a>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
