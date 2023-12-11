<script lang="ts">
  // import { page } from '$app/stores';
  import { Button } from '$lib/components';
  import ComingSoonModal from '../../../ComingSoonModal.svelte';

  let comingSoonOpen = false;
</script>

<div class="flex justify-between items-center">
  <p class="title-20-b">내용</p>
  <!-- <Button
    class="flex gap-1 px-2! h-6.5! rounded-2xl!"
    color="tertiary"
    href={`/tag/${$page.params.id}/edit`}
    type="link"
    variant="outlined"
  >
    <span class="body-13-b">편집</span>
    <i class="i-px-pencil-underline square-4" />
  </Button> -->
  <Button
    class="flex gap-1 px-2! h-6.5! rounded-2xl!"
    color="tertiary"
    variant="outlined"
    on:click={() => (comingSoonOpen = true)}
  >
    <span class="body-13-b">편집</span>
    <i class="i-px-pencil-underline square-4" />
  </Button>
</div>

<div class="border border-secondary rounded-2xl p-6 space-y-8">
  <div class="bodylong-16-m text-secondary text-center my-3">
    <p>아직 내용이 없어요</p>
    <p>위키의 내용을 작성해 보세요</p>
  </div>

  <!-- <div class="py-3">
    <h2 class="title-20-b">
      <a id="title-1" class="scroll-my-61px" href="#title-1">1. 한줄 설명</a>
    </h2>
    <hr class="my-2" />
    <p class="bodylong-16-m text-secondary">
      이성은 이것은 불어 그리하였는가? 바이며, 얼음이 주는 안고, 그러므로 것은 끝에 것이다. 역사를 위하여 같이 없으면,
      그들을 수 천하를 피는 봄바람이다.
    </p>
  </div>

  <div class="py-3">
    <h2 class="title-20-b">
      <a id="title-2" class="scroll-my-61px" href="#title-2">2. 역사</a>
    </h2>
    <hr class="my-2" />
    <p class="bodylong-16-m text-secondary">
      이성은 이것은 불어 그리하였는가? 바이며, 얼음이 주는 안고, 그러므로 것은 끝에 것이다. 역사를 위하여 같이 없으면,
      그들을 수 천하를 피는 봄바람이다.
    </p>
  </div>

  <div class="py-3">
    <h2 class="title-20-b">
      <a id="title-3" class="scroll-my-61px" href="#title-3">3. 사용 방식</a>
    </h2>
    <hr class="my-2" />
    <p class="bodylong-16-m text-secondary">
      이성은 이것은 불어 그리하였는가? 바이며, 얼음이 주는 안고, 그러므로 것은 끝에 것이다. 역사를 위하여 같이 없으면,
      그들을 수 천하를 피는 봄바람이다.이성은 이것은 불어 그리하였는가? 바이며, 얼음이 주는 안고, 그러므로 것은 끝에
      것이다. 역사를 위하여 같이 없으면, 그들을 수 천하를 피는 봄바람이다.이성은 이것은 불어 그리하였는가? 바이며,
      얼음이 주는 안고, 그러므로 것은 끝에 것이다. 역사를 위하여 같이 없으면, 그들을 수 천하를 피는 봄바람이다.
    </p>
  </div>

  <div class="py-3">
    <h2 class="title-20-b">
      <a id="title-4" class="scroll-my-61px" href="#title-4">4. 관련 이미지</a>
    </h2>
    <hr class="my-2" />
    <p class="bodylong-16-m text-secondary">
      이성은 이것은 불어 그리하였는가? 바이며, 얼음이 주는 안고, 그러므로 것은 끝에 것이다. 역사를 위하여 같이 없으면,
      그들을 수 천하를 피는 봄바람이다.이성은 이것은 불어 그리하였는가? 바이며, 얼음이 주는 안고, 그러므로 것은 끝에
      것이다. 역사를 위하여 같이 없으면, 그들을 수 천하를 피는 봄바람이다.이성은 이것은 불어 그리하였는가? 바이며,
      얼음이 주는 안고, 그러므로 것은 끝에 것이다. 역사를 위하여 같이 없으면, 그들을 수 천하를 피는 봄바람이다.
    </p>
  </div> -->
</div>

<ComingSoonModal bind:open={comingSoonOpen} />
