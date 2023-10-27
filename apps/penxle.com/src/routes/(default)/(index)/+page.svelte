<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { graphql } from '$glitch';
  import { ChannelIOButton } from '$lib/channel.io';
  import { Tag } from '$lib/components';
  import { TabHeadItem } from '$lib/components/tab';
  import TabHead from '$lib/components/tab/TabHead.svelte';

  $: query = graphql(`
    query IndexPage_Query {
      ...ChannelIOButton_query
    }
  `);
</script>

<Helmet
  description="펜슬은 개인 창작자들을 위한 자유롭고 즐거운 창작 공간이에요."
  image={{
    src: 'https://c.pnxl.net/assets/opengraph/default-cover.png',
    size: 'large',
  }}
  title="펜슬 - 함께 그리는 반짝임"
/>

<div class="flex flex-col w-full max-w-185 my-6">
  <TabHead class="mb-9">
    <TabHeadItem id={1} activeTabValue={1}>추천 게시물</TabHeadItem>
    <TabHeadItem id={2}>관심 태그</TabHeadItem>
    <TabHeadItem id={3}>관심 스페이스</TabHeadItem>
  </TabHead>

  <div class="space-y-11.5">
    <div>
      <div class="flex mb-4 items-center justify-between">
        <div class="flex">
          <div class="relative">
            <img
              class="square-10.5 rounded-xl"
              alt="spaceLogo"
              src="https://c.pnxl.net/images/23/10/n/nn/nn0f8jh65wx4qv2z.jpg?s=128"
            />
            <img
              class="square-6 rounded-full absolute border border-bg-primary -right-1 -bottom-1"
              alt="memberProfile"
              src="https://c.pnxl.net/images/23/10/n/nn/nn0f8jh65wx4qv2z.jpg?s=128"
            />
          </div>
          <div class="ml-3">
            <p class="body-15-b">
              finn님이 test에 <mark class="text-purple-50">유료글</mark>
              을 게시했어요
            </p>
            <p class="body-13-m text-secondary">finn · 10분 전</p>
          </div>
        </div>
        <i class="i-lc-more-vertical square-6 text-icon-secondary" />
      </div>

      <a class="w-full border border-secondary rounded-2xl p-6 block bg-cardprimary" href="/test/741932415957">
        <p class="title-20-b mb-2">유료 테스트</p>
        <p class="bodylong-16-m mb-2 text-secondary">유료 테스트 글이예요</p>
        <Tag size="sm">#유료</Tag>
        <Tag size="sm">#소설</Tag>
        <Tag size="sm">#사이트</Tag>
      </a>
    </div>

    <div>
      <div class="flex mb-4 items-center justify-between">
        <div class="flex">
          <div class="relative">
            <img
              class="square-10.5 rounded-xl"
              alt="spaceLogo2"
              src="https://c.pnxl.net/images/23/10/b/bp/bp8zhq3ddtxmv36a.png?s=256"
            />
            <img
              class="square-6 rounded-full absolute border border-bg-primary -right-1 -bottom-1"
              alt="memberProfile2"
              src="https://c.pnxl.net/images/23/10/u/uj/ujx4cf6wq2b2ui0p.jpg?s=256"
            />
          </div>
          <div class="ml-3">
            <p class="body-15-b">작성자님이 스페이스에 게시했어요</p>
            <p class="body-13-m text-secondary">작성자 · 1시간 전</p>
          </div>
        </div>
        <i class="i-lc-more-vertical square-6 text-icon-secondary" />
      </div>

      <div class="w-full border border-secondary rounded-2xl p-6 bg-cardprimary">
        <p class="title-20-b mb-2">제목글자로렘입숨나랏말싸미듕귁에달아사맛디아니할세</p>
        <div class="flex gap-3">
          <div class="flex flex-col justify-between">
            <div class="flex gap-3 mb-4">
              <img
                class="rounded-lg square-45"
                alt="postImage1"
                src="https://c.pnxl.net/images/23/11/y/yi/yi9w61i6mcbvmjtp.jpeg?s=256"
              />
              <img
                class="rounded-lg square-45"
                alt="postImage2"
                src="https://c.pnxl.net/images/23/10/u/uj/ujx4cf6wq2b2ui0p.jpg?s=256"
              />
              <img
                class="rounded-lg square-45"
                alt="postImage3"
                src="https://c.pnxl.net/images/23/11/d/d4/d4g1ejdvotjme0ru.jpg?s=256"
              />
              <img
                class="rounded-lg square-45 overflow-hidden object-cover object-left rounded-r-none"
                alt="postImage4"
                src="https://c.pnxl.net/images/23/10/o/oy/oy71977pmohjcak0.jpeg?s=256"
              />
            </div>
            <div>
              <Tag size="sm">#유료</Tag>
              <Tag size="sm">#소설</Tag>
              <Tag size="sm">#사이트</Tag>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div>
      <div class="flex mb-4 items-center justify-between">
        <div class="flex">
          <div class="relative">
            <img
              class="square-10.5 rounded-xl"
              alt="spaceLogo2"
              src="https://c.pnxl.net/images/23/10/b/bp/bp8zhq3ddtxmv36a.png?s=256"
            />
            <img
              class="square-6 rounded-full absolute border border-bg-primary -right-1 -bottom-1"
              alt="memberProfile2"
              src="https://c.pnxl.net/images/23/10/u/uj/ujx4cf6wq2b2ui0p.jpg?s=256"
            />
          </div>
          <div class="ml-3">
            <p class="body-15-b">
              작성자님이 스페이스에 <mark class="text-purple-50">유료글</mark>
              을 게시했어요
            </p>
            <p class="body-13-m text-secondary">작성자 · 1일 전</p>
          </div>
        </div>
        <i class="i-lc-more-vertical square-6 text-icon-secondary" />
      </div>

      <div class="w-full border border-secondary rounded-2xl p-6 bg-cardprimary">
        <p class="title-20-b mb-2">제목을 지어봤어요</p>
        <div class="flex gap-3">
          <div class="flex flex-col justify-between">
            <p class="bodylong-16-m mb-2 text-secondary">
              고행을 길을 예가 그들은 위하여 우리 목숨이 너의 그리하였는가? 물방아 꾸며 않는 못할 인도하겠다는 동력은
              관현악이며, 무엇이 심장의 것이다. 산야에 찾아 그들의 이 예가 따뜻한 맺어, 있는 붙잡아 끓는다. 석가는
              타오르고 천지는 용감하고 듣기만 길을 목숨이 고행을 교향악이다. 찾아 온갖 끝까지 노래하며 실로 아니다.
            </p>
            <div>
              <Tag size="sm">#로렘입숨</Tag>
              <Tag size="sm">#일러스트</Tag>
              <Tag size="sm">#만화</Tag>
            </div>
          </div>
          <img
            class="rounded-lg square-45"
            alt="memberProfile2"
            src="https://c.pnxl.net/images/23/10/u/uj/ujx4cf6wq2b2ui0p.jpg?s=256"
          />
        </div>
      </div>
    </div>
  </div>
</div>

<div class="w-full max-w-90 mt-20 ml-15 space-y-10">
  <div>
    <p class="body-15-b mb-4">✨ 최근 게시물을 게시한 스페이스</p>

    <div class="flex items-center justify-between p-2 hover:bg-surface-primary rounded-lg">
      <div class="flex">
        <img
          class="square-10.5 rounded-xl mr-3"
          alt="spaceLogo"
          src="https://c.pnxl.net/images/23/10/n/nn/nn0f8jh65wx4qv2z.jpg?s=128"
        />
        <div>
          <p class="body-15-b">test</p>
          <p class="body-13-m text-secondary">스페이스 설명</p>
        </div>
      </div>

      <div class="bg-gray-80 py-2 px-3 rounded-12 body-13-m text-gray-5">+관심</div>
    </div>

    <div class="flex items-center justify-between p-2 hover:bg-surface-primary rounded-lg">
      <div class="flex">
        <img
          class="square-10.5 rounded-xl mr-3"
          alt="spaceLogo"
          src="https://c.pnxl.net/images/23/10/b/bp/bp8zhq3ddtxmv36a.png?s=256"
        />
        <div>
          <p class="body-15-b">스페이스</p>
          <p class="body-13-m text-secondary">스페이스 설명</p>
        </div>
      </div>

      <div class="bg-gray-80 py-2 px-3 rounded-12 body-13-m text-gray-5">+관심</div>
    </div>

    <div class="flex items-center justify-between p-2 hover:bg-surface-primary rounded-lg">
      <div class="flex">
        <img
          class="square-10.5 rounded-xl mr-3"
          alt="spaceLogo"
          src="https://c.pnxl.net/images/23/10/b/bp/bp8zhq3ddtxmv36a.png?s=256"
        />
        <div>
          <p class="body-15-b">스페이스</p>
          <p class="body-13-m text-secondary">스페이스 설명</p>
        </div>
      </div>

      <div class="bg-gray-80 py-2 px-3 rounded-12 body-13-m text-gray-5">+관심</div>
    </div>
  </div>

  <div>
    <p class="body-15-b mb-4">🔥 최근 사용된 태그</p>

    <div class="flex flex-wrap gap-2">
      <Tag size="sm">#일러스트</Tag>
      <Tag size="sm">#만화</Tag>
      <Tag size="sm">#소설</Tag>
      <Tag size="sm">#사이트</Tag>
      <Tag size="sm">#너의이름은</Tag>
      <Tag size="sm">#미소의세상</Tag>
      <Tag size="sm">#그림</Tag>
      <Tag size="sm">#원신</Tag>
      <Tag size="sm">#붕괴</Tag>
    </div>
  </div>

  <div>
    <p class="body-15-b mb-4">👋🏻 새로 추가된 태그</p>

    <div class="flex flex-wrap gap-2">
      <Tag size="sm">#새로운태그</Tag>
      <Tag size="sm">#만화</Tag>
      <Tag size="sm">#너의이름은</Tag>
      <Tag size="sm">#소설</Tag>
      <Tag size="sm">#사이트</Tag>
      <Tag size="sm">#붕괴</Tag>
      <Tag size="sm">#그림</Tag>
      <Tag size="sm">#미소의세상</Tag>
      <Tag size="sm">#원신</Tag>
    </div>
  </div>

  <div>
    <p class="body-15-b mb-4">💰 오늘의 유료글</p>

    <div class="p-2.5">
      <div class="flex gap-3 items-center mb-2.5">
        <img
          class="square-6 rounded-full border border-bg-primary"
          alt="memberProfile"
          src="https://c.pnxl.net/images/23/10/n/nn/nn0f8jh65wx4qv2z.jpg?s=128"
        />
        <p class="body-13-sb">test의 포스트</p>
      </div>
      <p>유료 테스트</p>
    </div>

    <div class="p-2.5">
      <div class="flex gap-3 items-center mb-2.5">
        <img
          class="square-6 rounded-full border border-bg-primary"
          alt="memberProfile"
          src="https://c.pnxl.net/images/23/10/u/uj/ujx4cf6wq2b2ui0p.jpg?s=256"
        />
        <p class="body-13-sb">스페이스의 포스트</p>
      </div>
      <p>제목을 지어봤어요</p>
    </div>
  </div>
</div>

<ChannelIOButton {$query} />
