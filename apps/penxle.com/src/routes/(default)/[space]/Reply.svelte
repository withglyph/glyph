<script lang="ts">
  import dayjs from 'dayjs';
  import { Menu, MenuItem } from '$lib/components/menu';
  import { Button } from '$lib/components/v2';

  let 창작자 = false;
  let 구매자 = true;
  let secret = true;
  let pinned = false;
</script>

<div class="px-5 py-6 bg-gray-50 flex gap-2.5 border-t border-gray-100">
  <i class="i-px2-reply-bar square-5 text-gray-400" />

  <div class="grow">
    <div class="flex items-center justify-between">
      {#if 창작자}
        <p class="bg-gray-400 text-white text-14-sb px-2 rounded-1.5 h-28px flex center">창작자 이름</p>
      {:else}
        <p class="text-15-sb flex gap-1 items-center flex-wrap">
          익명의 고라니
          {#if 구매자}
            <mark class="text-11-m text-teal-500">구매자</mark>
          {/if}
          {#if secret}
            <i class="i-tb-lock square-4 text-gray-400" />
          {/if}
        </p>
      {/if}

      <Menu placement="bottom-start">
        <button slot="value" class="i-tb-dots-vertical square-5 text-gray-500" type="button" />

        <!-- if 내가 스페이스 멤버이면 고정 -->
        <MenuItem>{pinned ? '고정 해제' : '고정'}</MenuItem>
        <!-- 이 댓글이 내 댓글이면 수정 -->
        <MenuItem>수정</MenuItem>
        <!-- 내가 스페이스 멤버이면 차단 -->
        <MenuItem>차단</MenuItem>
        <!-- 내가 스페이스 멤버이거나, 이 댓글이 내 댓글이면 삭제 -->
        <MenuItem>삭제</MenuItem>
      </Menu>
    </div>

    <!-- 비밀댓글 && 내가 작성자가 아니고 && 내가 스페이스 멤버가 아닐 때 -->
    {#if true}
      <p class="text-15-r text-gray-400 mt-2 mb-1.5">비밀댓글이에요</p>
    {:else}
      <p class="text-15-r mt-2 mb-1.5">댓글 내용</p>
    {/if}

    <!-- 비밀댓글이 아님 || 내가 댓글 작성자 || 내가 스페이스 멤버일 때 -->
    {#if true}
      <time class="text-11px font-300 text-gray-400 block">{dayjs(new Date()).formatAsDateTime()}</time>

      <div class="mt-5 flex gap-2 items-center">
        <Button class="text-gray-500 flex items-center gap-1 text-12-r" size="md" variant="outline">
          <i class="i-tb-heart square-4 block text-gray-500" />
          0
        </Button>

        <div class="ring ring-teal-500 rounded-full square-5.5 relative m-1.5">
          <div class="bg-gray-500 rounded-full square-5.5" />
          <!-- 창작자가 좋아요 눌렀을 때 -->
          {#if true}
            <i class="i-tb-heart-filled text-teal-500 square-4 absolute -bottom-6px -right-6px" />
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>
