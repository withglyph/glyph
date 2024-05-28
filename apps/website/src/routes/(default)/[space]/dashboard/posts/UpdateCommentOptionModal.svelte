<script lang="ts">
  import { SegmentButtonGroup, ToggleButton, Tooltip } from '$lib/components';
  import { Switch } from '$lib/components/forms';
  import { Button, Modal } from '$lib/components/v2';
  import { css } from '$styled-system/css';
  import { flex, grid } from '$styled-system/patterns';

  export let open = false;
  export let selectedPostIds: string[] = [];
  $: console.log(selectedPostIds);
</script>

<Modal style={css.raw({ paddingBottom: '60px' })} bind:open>
  <svelte:fragment slot="title">댓글옵션 변경</svelte:fragment>

  <div class={flex({ direction: 'column', gap: '34px' })}>
    <Switch style={flex.raw({ justify: 'space-between', align: 'center' })}>
      <dl>
        <dt class={css({ marginBottom: '2px', fontSize: '14px' })}>댓글 허용</dt>
        <dd class={css({ fontSize: '13px', color: 'gray.600' })}>
          독자들이 포스트에 대한 의견을 나누고 소통할 수 있어요
        </dd>
      </dl>
    </Switch>

    <div>
      <dl class={css({ marginBottom: '16px' })}>
        <dt class={css({ marginBottom: '2px', fontSize: '14px' })}>댓글을 달 수 있는 계정</dt>
        <dd class={css({ fontSize: '13px', color: 'gray.600' })}>
          포스트에 대한 댓글을 달 수 있는 계정을 선택할 수 있어요
        </dd>
      </dl>

      <SegmentButtonGroup style={grid.raw({ columns: 2, gap: '0' })}>
        <ToggleButton name="commentQualification" type="radio" value="ANY">모든계정</ToggleButton>
        <Tooltip offset={4}>
          <!-- enabled={$query.me.personalIdentity === null} message="본인 인증 후 이용할 수 있어요" -->
          <ToggleButton name="commentQualification" style={css.raw({ width: 'full' })} type="radio" value="IDENTIFIED">
            본인 인증된 계정
          </ToggleButton>
        </Tooltip>
      </SegmentButtonGroup>
    </div>
  </div>

  <Button slot="action" style={css.raw({ width: 'full' })} size="lg" variant="gradation-fill">확인</Button>
</Modal>
