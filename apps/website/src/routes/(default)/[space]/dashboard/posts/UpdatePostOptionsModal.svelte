<script lang="ts">
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Switch } from '$lib/components/forms';
  import { Button, Modal } from '$lib/components/v2';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';

  export let open = false;
  export let selectedPostIds: string[] = [];

  const labelWithDescriptionStyle = css({
    '& > dt': { marginBottom: '2px', fontSize: '14px' },
    '& > dd': { fontSize: '12px', color: 'gray.600' },
  });

  let receiveFeedback = true;
  let discloseStats = true;
  let receivePatronage = true;
  let protectContent = true;

  const updatePostOptions = graphql(`
    mutation UpdatePostOptionsModal_UpdatePostOptions($input: UpdatePostOptionsInput!) {
      updatePostOptions(input: $input) {
        id
        receiveFeedback
        discloseStats
        receivePatronage
        protectContent
      }
    }
  `);
</script>

<Modal style={css.raw({ paddingBottom: { sm: '54px' } })} bind:open>
  <svelte:fragment slot="title">세부옵션 변경</svelte:fragment>

  <div class={flex({ direction: 'column', gap: '34px' })}>
    <Switch
      name="receiveFeedback"
      style={flex.raw({ justify: 'space-between', align: 'center' })}
      bind:checked={receiveFeedback}
      on:change={(e) => (receiveFeedback = e.currentTarget.checked)}
    >
      <dl class={labelWithDescriptionStyle}>
        <dt>피드백</dt>
        <dd>가장 오래 머무른 구간, 밑줄, 이모지 등 피드백을 받아요</dd>
      </dl>
    </Switch>

    <Switch
      name="discloseStats"
      style={flex.raw({ justify: 'space-between', align: 'center' })}
      bind:checked={discloseStats}
      on:change={(e) => (discloseStats = e.currentTarget.checked)}
    >
      <dl class={labelWithDescriptionStyle}>
        <dt>포스트 세부 공개</dt>
        <dd>독자에게 좋아요, 조회수를 공유해요</dd>
      </dl>
    </Switch>

    <Switch
      name="receivePatronage"
      style={flex.raw({ justify: 'space-between', align: 'center' })}
      bind:checked={receivePatronage}
      on:change={(e) => (receivePatronage = e.currentTarget.checked)}
    >
      <dl class={labelWithDescriptionStyle}>
        <dt>창작자 후원</dt>
        <dd>독자들이 포스트에 자유롭게 후원할 수 있어요</dd>
      </dl>
    </Switch>

    <Switch
      name="protectContent"
      style={flex.raw({ justify: 'space-between', align: 'center' })}
      bind:checked={protectContent}
      on:change={(e) => (protectContent = e.currentTarget.checked)}
    >
      <dl class={labelWithDescriptionStyle}>
        <dt>포스트 내용 보호</dt>
        <dd>포스트의 내용을 보호하기 위해 우클릭 또는 복사를 제한해요</dd>
      </dl>
    </Switch>
  </div>

  <Button
    slot="action"
    style={css.raw({ width: 'full' })}
    size="lg"
    variant="gradation-fill"
    on:click={() => {
      Promise.all(
        selectedPostIds.map((id) =>
          updatePostOptions({ postId: id, receiveFeedback, discloseStats, receivePatronage, protectContent }),
        ),
      );
      mixpanel.track('post:update:option', {
        postIds: selectedPostIds,
        receiveFeedback,
        discloseStats,
        receivePatronage,
        protectContent,
      });
      open = false;
    }}
  >
    확인
  </Button>
</Modal>
