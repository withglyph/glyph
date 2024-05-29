<script lang="ts">
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Image } from '$lib/components';
  import { ThumbnailPicker } from '$lib/components/media';
  import { Button, Modal } from '$lib/components/v2';
  import { toast } from '$lib/notification';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import type { Image_image } from '$glitch';

  export let open = false;
  export let selectedPostIds: string[] = [];

  let thumbnailPicker: ThumbnailPicker;

  let thumbnail: ({ id: string; name: string } & Image_image) | null | undefined = undefined;

  const replacePostThumbnail = graphql(`
    mutation UpdateThumbnailModal_ReplacePostThumbnail_Mutation($input: ReplacePostThumbnailInput!) {
      replacePostThumbnail(input: $input) {
        id

        thumbnail {
          id
        }
      }
    }
  `);
</script>

<Modal bind:open>
  <svelte:fragment slot="title">썸네일 변경</svelte:fragment>

  <p class={css({ marginBottom: '8px', fontSize: '14px' })}>썸네일</p>

  {#if thumbnail}
    <div
      class={flex({
        justify: 'space-between',
        align: 'center',
        gap: '12px',
        borderWidth: '1px',
        borderColor: 'gray.200',
        padding: '14px',
        smDown: { flexDirection: 'column' },
      })}
    >
      <div class={flex({ align: 'center', gap: '8px', width: 'full', truncate: true })}>
        <Image
          style={css.raw({ height: '38px', aspectRatio: '16/10', objectFit: 'cover', backgroundColor: 'gray.300' })}
          $image={thumbnail}
          size={64}
        />

        <p class={css({ fontSize: '14px', fontWeight: 'medium', color: 'gray.500', truncate: true })}>
          {thumbnail.name}
        </p>
      </div>

      <div
        class={flex({
          'align': 'center',
          'gap': '8px',
          'marginLeft': 'auto',
          '& > *': {
            width: '68px',
          },
        })}
        role="group"
      >
        <Button size="sm" variant="red-outline" on:click={() => (thumbnail = null)}>삭제</Button>
        <Button size="sm" variant="gray-outline" on:click={() => thumbnailPicker.show()}>변경</Button>
      </div>
    </div>
  {:else}
    <!-- eslint-disable-next-line svelte/valid-compile -->
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label
      class={flex({
        cursor: 'pointer',
        justify: 'space-between',
        align: 'center',
        borderWidth: '1px',
        borderColor: 'gray.150',
        padding: '14px',
        width: 'full',
      })}
    >
      <div class={flex({ align: 'center', gap: '8px' })}>
        <Image style={css.raw({ height: '38px', aspectRatio: '16/10' })} placeholder size={64} />
        <span class={css({ fontSize: '14px', fontWeight: 'medium', color: 'gray.500' })}>썸네일을 업로드해주세요</span>
      </div>

      <Button
        style={css.raw({ width: '68px' })}
        size="sm"
        variant="gray-outline"
        on:click={() => thumbnailPicker.show()}
      >
        업로드
      </Button>
    </label>
  {/if}

  <p class={css({ marginTop: '6px', fontSize: '13px', color: 'gray.500' })}>
    추천 사이즈 : 800X500픽셀 이상 (16:10 비율)
  </p>

  <Button
    slot="action"
    style={css.raw({ width: 'full' })}
    size="lg"
    variant="gradation-fill"
    on:click={() => {
      if (thumbnail) {
        Promise.all(selectedPostIds.map((id) => replacePostThumbnail({ postId: id, thumbnailId: thumbnail?.id })));
        mixpanel.track('post:replace:thumbnail', { postIds: selectedPostIds });
        toast.success('썸네일 변경이 완료되었어요');
      }

      open = false;
    }}
  >
    확인
  </Button>
</Modal>

<ThumbnailPicker
  bind:this={thumbnailPicker}
  keepBoundsWhenClosed
  ratio="post"
  on:change={(e) => (thumbnail = e.detail)}
/>
