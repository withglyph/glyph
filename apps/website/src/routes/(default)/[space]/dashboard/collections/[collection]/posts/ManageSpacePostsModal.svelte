<script lang="ts">
  import { onMount } from 'svelte';
  import IconHelpLine from '~icons/glyph/help-line';
  import IconMinus from '~icons/tabler/minus';
  import IconPlus from '~icons/tabler/plus';
  import IconSearch from '~icons/tabler/search';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Icon, Image, Tooltip } from '$lib/components';
  import { Checkbox } from '$lib/components/forms';
  import { Button, Modal } from '$lib/components/v2';
  import { TextInput } from '$lib/components/v2/forms';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';

  export let open = false;
  export let collectionId: string;
  export let spaceSlug: string;

  let collectionlessOnly = false;
  let selectedPostIds: string[] = [];
  let query = '';

  $: spacePostsQuery = graphql(`
    query ManageSpacePostsModal_Query($slug: String!, $collectionlessOnly: Boolean) @_manual {
      space(slug: $slug) {
        id

        posts(collectionlessOnly: $collectionlessOnly) {
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
      }
    }
  `);

  onMount(() => {
    spacePostsQuery.refetch({ slug: spaceSlug, collectionlessOnly: false });
  });

  const appendSpaceCollectionPosts = graphql(`
    mutation ManageSpacePostsModal_AppendSpaceCollectionPosts_Mutation($input: AppendSpaceCollectionPostsInput!) {
      appendSpaceCollectionPosts(input: $input) {
        id
      }
    }
  `);
</script>

<Modal style={flex.raw({ direction: 'column', grow: '1', paddingTop: '0' })} size="lg" bind:open>
  <div slot="title" class={flex({ align: 'center', gap: '4px' })}>
    <p>포스트 추가</p>
    <Tooltip message="다른 컬렉션에 속하지 않은 포스트만 컬렉션에 추가할 수 있어요" offset={4} placement="top">
      <Icon style={css.raw({ 'color': 'gray.300', '& *': { strokeWidth: '[1]' } })} icon={IconHelpLine} />
    </Tooltip>
  </div>

  <div
    class={css({
      position: 'sticky',
      top: '0',
      marginX: '-20px',
      paddingX: '20px',
      paddingTop: '16px',
      paddingBottom: '27px',
      backgroundColor: 'gray.0',
      zIndex: '1',
    })}
  >
    <TextInput style={css.raw({ marginBottom: '10px' })} placeholder="포스트를 검색해주세요" bind:value={query}>
      <Icon slot="left-icon" style={css.raw({ color: 'gray.400' })} icon={IconSearch} />
    </TextInput>
    <Checkbox
      style={css.raw({ marginLeft: 'auto', color: 'gray.500', width: 'fit' })}
      size="sm"
      bind:checked={collectionlessOnly}
      on:change={() => {
        collectionlessOnly = !collectionlessOnly;
        spacePostsQuery.refetch({ slug: spaceSlug, collectionlessOnly });
      }}
    >
      타 컬렉션에 속하지 않은 포스트만 보기
    </Checkbox>
  </div>

  <ul class={flex({ direction: 'column', grow: '1' })}>
    {#if $spacePostsQuery}
      {#each $spacePostsQuery.space.posts.filter((p) => p.publishedRevision?.title?.includes(query) || p.publishedRevision?.subtitle?.includes(query)) as post (post.id)}
        {@const included = !!post.collection?.id || post.collection?.id === collectionId}

        <li
          class={css(
            { display: 'flex', alignItems: 'flex-start', gap: '8px', paddingY: '16px' },
            included && { paddingY: '20px' },
          )}
        >
          <Image
            style={css.raw(
              { flex: 'none', width: '80px', aspectRatio: '16/10', objectFit: 'cover' },
              included && { opacity: '80' },
            )}
            $image={post.thumbnail}
            placeholder
            size={96}
          />

          <div class={css({ flexGrow: '1', truncate: true })}>
            {#if included}
              <p class={css({ marginBottom: '2px', fontSize: '13px', fontWeight: 'medium', color: '[#898989]' })}>
                [{post.collection?.name}]에 속해있음
              </p>
            {/if}
            <p
              class={css(
                { fontSize: '14px', fontWeight: 'semibold', color: 'gray.600', truncate: true },
                included && { color: 'gray.300' },
              )}
            >
              {post.publishedRevision?.title ?? '(제목 없음)'}
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
              {post.publishedRevision?.subtitle ?? ''}
            </p>

            {#if !included}
              <div class={flex({ justify: 'flex-end', paddingRight: '1px', paddingBottom: '1px' })}>
                {#if selectedPostIds.includes(post.id)}
                  <Button
                    style={flex.raw({ gap: '4px' })}
                    variant="brand-fill"
                    on:click={() => {
                      selectedPostIds = selectedPostIds.filter((id) => id !== post.id);
                    }}
                  >
                    <Icon icon={IconMinus} />
                    컬렉션 해제
                  </Button>
                {:else}
                  <Button
                    style={flex.raw({ gap: '4px' })}
                    variant="gray-sub-fill"
                    on:click={() => {
                      selectedPostIds = [...selectedPostIds, post.id];
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
      {:else}
        <li
          class={css({ marginY: 'auto', paddingY: '77px', fontSize: '15px', color: 'gray.500', textAlign: 'center' })}
        >
          포스트가 없어요
        </li>
      {/each}
    {/if}
  </ul>

  <Button
    slot="action"
    style={css.raw({ width: 'full' })}
    size="lg"
    on:click={async () => {
      if (!$spacePostsQuery) return;

      if (selectedPostIds.length > 0) {
        await appendSpaceCollectionPosts({ postIds: selectedPostIds, spaceCollectionId: collectionId });
        mixpanel.track('space:collection:post:append', {
          spaceId: $spacePostsQuery.space.id,
          spaceCollectionId: collectionId,
          postIds: selectedPostIds,
        });
      }

      open = false;
    }}
  >
    확인
  </Button>
</Modal>
