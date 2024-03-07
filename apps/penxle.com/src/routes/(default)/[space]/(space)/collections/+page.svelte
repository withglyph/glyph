<script lang="ts">
  import IconAlertTriangle from '~icons/tabler/alert-triangle';
  import IconPlus from '~icons/tabler/plus';
  import { graphql } from '$glitch';
  import { Button, Helmet, Icon, Image } from '$lib/components';
  import { CreateCollectionModal } from '$lib/components/pages/collections';
  import { css } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';

  $: query = graphql(`
    query SpaceCollectionsPage_Query($slug: String!) {
      space(slug: $slug) {
        id
        slug
        name

        myMasquerade {
          id
          blocked
        }

        collections {
          id
          name
          count
          thumbnail {
            id
            ...Image_image
          }
        }

        meAsMember {
          id
        }
      }
    }
  `);

  let openCreateCollectionModal = false;
</script>

<Helmet
  description={`${$query.space.name} 스페이스의 컬렉션 목록을 확인해보세요.`}
  title={`${$query.space.name}의 컬렉션`}
/>

<div
  class={css(
    {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      flexGrow: '1',
      width: 'full',
      maxWidth: '800px',
      minHeight: '176px',
      sm: { paddingY: '16px' },
      smDown: { gap: '8px', padding: '0', backgroundColor: 'gray.100' },
    },
    ($query.space.collections.length === 0 || $query.space.myMasquerade?.blocked) && {
      justifyContent: 'center',
      alignItems: 'center',
      gap: '0',
    },
  )}
>
  {#if $query.space.myMasquerade?.blocked}
    <Icon style={css.raw({ size: '28px' })} icon={IconAlertTriangle} />
    <p class={css({ marginTop: '4px', marginBottom: '2px', fontSize: '18px', fontWeight: 'semibold' })}>
      차단당했습니다
    </p>
    <p class={css({ fontSize: '14px', color: 'gray.500' })}>{$query.space.name}의 게시물을 볼 수 없어요</p>
  {:else if $query.space.collections.length > 0}
    <ul class={flex({ direction: 'column', gap: '4px' })}>
      {#each $query.space.collections as collection (collection.id)}
        <li>
          <a
            class={flex({
              gap: '12px',
              padding: '8px',
              backgroundColor: 'white',
              sm: { borderRadius: '12px', backgroundColor: { _hover: 'gray.50', _focus: 'gray.50' } },
            })}
            href={`/${$query.space.slug}/collections/${collection.id}`}
          >
            {#if collection.thumbnail}
              <Image
                style={css.raw({ borderRadius: '8px', width: '96px', height: '120px' })}
                $image={collection.thumbnail}
              />
            {/if}
            <dl class={css({ paddingY: '8px' })}>
              <dt class={css({ marginBottom: '4px', fontWeight: 'bold' })}>{collection.name}</dt>
              <dd class={css({ fontSize: '14px', fontWeight: 'medium', color: 'gray.500' })}>
                {collection.count}개의 포스트
              </dd>
            </dl>
          </a>
        </li>
      {/each}
    </ul>

    {#if $query.space.meAsMember}
      <Button
        style={flex.raw({ gap: '8px', marginX: '8px', marginBottom: '8px', backgroundColor: 'white' })}
        color="tertiary"
        size="lg"
        variant="outlined"
        on:click={() => (openCreateCollectionModal = true)}
      >
        새 컬렉션 추가하기 <Icon style={css.raw({ size: '20px' })} icon={IconPlus} />
      </Button>
    {/if}
  {:else}
    <div class={center({ flexDirection: 'column' })}>
      <p class={css({ fontSize: '15px', fontWeight: 'bold', color: 'gray.500' })}>
        아직 스페이스에 업로드된 컬렉션이 없어요
      </p>
      {#if $query.space.meAsMember}
        <Button style={css.raw({ marginTop: '20px' })} size="lg" on:click={() => (openCreateCollectionModal = true)}>
          컬렉션 생성하기
        </Button>
      {/if}
    </div>
  {/if}
</div>

<CreateCollectionModal spaceId={$query.space.id} bind:open={openCreateCollectionModal} />
