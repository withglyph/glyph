<script lang="ts">
  import IconMinus from '~icons/tabler/minus';
  import IconPlus from '~icons/tabler/plus';
  import { fragment, graphql } from '$glitch';
  import { Icon, Image } from '$lib/components';
  import { Button } from '$lib/components/v2';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import type { ManageSpacePostsModal_SpacePost_post } from '$glitch';

  let _post: ManageSpacePostsModal_SpacePost_post;
  export { _post as $post };

  export let included = false;
  export let selectedPostIds: string[] = [];

  $: post = fragment(
    _post,
    graphql(`
      fragment ManageSpacePostsModal_SpacePost_post on Post {
        id

        publishedRevision {
          id
          title
          subtitle
        }

        collection {
          id
          name
        }

        thumbnail {
          id
          ...Image_image
        }
      }
    `),
  );
</script>

<li
  class={css(
    {
      'display': 'flex',
      'alignItems': 'flex-start',
      'gap': '8px',
      'paddingY': '16px',
      '& + &': { borderTopWidth: '1px', borderColor: 'gray.50' },
    },
    included && { paddingY: '20px' },
  )}
>
  <Image
    style={css.raw(
      { flex: 'none', width: '80px', aspectRatio: '16/10', objectFit: 'cover' },
      included && { opacity: '80' },
    )}
    $image={$post.thumbnail}
    placeholder
    size={96}
  />

  <div class={css({ flexGrow: '1', truncate: true })}>
    {#if included}
      <p class={css({ marginBottom: '2px', fontSize: '13px', fontWeight: 'medium', color: '[#898989]' })}>
        [{$post.collection?.name}]에 속해있음
      </p>
    {/if}
    <p
      class={css(
        { fontSize: '14px', fontWeight: 'semibold', color: 'gray.600', truncate: true },
        included && { color: 'gray.300' },
      )}
    >
      {$post.publishedRevision?.title ?? '(제목 없음)'}
    </p>
    <p
      class={css(
        {
          marginBottom: '8px',
          fontSize: '13px',
          color: 'gray.600',
          height: '19px',
          truncate: true,
        },
        included && { color: 'gray.300' },
      )}
    >
      {$post.publishedRevision?.subtitle ?? ''}
    </p>

    {#if !included}
      <div class={flex({ justify: 'flex-end', paddingRight: '1px', paddingBottom: '1px' })}>
        {#if selectedPostIds.includes($post.id)}
          <Button
            style={flex.raw({ gap: '4px', paddingY: '9px' })}
            size="sm"
            variant="brand-fill"
            on:click={() => {
              selectedPostIds = selectedPostIds.filter((id) => id !== $post.id);
            }}
          >
            <Icon icon={IconMinus} />
            컬렉션 해제
          </Button>
        {:else}
          <Button
            style={flex.raw({ gap: '4px', paddingY: '9px' })}
            size="sm"
            variant="gray-sub-fill"
            on:click={() => {
              selectedPostIds = [...selectedPostIds, $post.id];
            }}
          >
            <Icon icon={IconPlus} />
            컬렉션 추가
          </Button>
        {/if}
      </div>
    {/if}
  </div>
</li>
