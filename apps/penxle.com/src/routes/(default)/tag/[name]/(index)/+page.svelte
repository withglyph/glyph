<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import IconPencil from '~icons/tabler/pencil';
  import { graphql } from '$glitch';
  import { Button, Icon } from '$lib/components';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import ComingSoonModal from '../../../ComingSoonModal.svelte';

  $: query = graphql(`
    query TagPage_Query($name: String!) {
      tag(name: $name) {
        id
        name
      }
    }
  `);

  let comingSoonOpen = false;
</script>

<Helmet description={`펜슬의 #${$query.tag.name} 태그`} title={`#${$query.tag.name}`} />

<div class={flex({ justify: 'space-between', align: 'center' })}>
  <p class={css({ fontSize: '20px', fontWeight: 'bold' })}>내용</p>
  <Button
    class={flex({ gap: '4px', borderRadius: '16px', paddingX: '8px', height: '26px' })}
    color="tertiary"
    variant="outlined"
    on:click={() => (comingSoonOpen = true)}
  >
    <span class={css({ fontSize: '13px', fontWeight: 'bold' })}>편집</span>
    <Icon style={css.raw({ size: '16px' })} icon={IconPencil} />
  </Button>
</div>

<div class={css({ gap: '32px', borderWidth: '1px', borderColor: 'gray.200', borderRadius: '16px', padding: '24px' })}>
  <div class={css({ marginY: '12px', fontSize: '16px', textAlign: 'center', color: 'gray.500' })}>
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
