<script lang="ts">
  import { graphql } from '$glitch';
  import Footer from '../../Footer.svelte';
  import Header from '../../Header.svelte';

  $: query = graphql(`
    query SpaceSettingsLayout_Query($slug: String!) {
      space(slug: $slug) {
        id
        slug
        name

        meAsMember {
          id
        }
      }

      ...DefaultLayout_Header_query
    }
  `);
</script>

<Header {$query} />

<main class="flex justify-center gap-20">
  <aside class="grow pr-4 flex flex-col items-end <sm:hidden">
    <h1 class="font-extrabold mt-10">스페이스 관리</h1>

    <nav>
      <ul class="body-16-b text-disabled">
        <li>
          <a class="px-2 py-6.5 inline-block w-full" href="/{$query.space.slug}/dashboard">대시보드</a>
        </li>
        <li>
          <a class="px-2 py-6.5 inline-block w-full" href="/{$query.space.slug}/members">멤버 관리</a>
        </li>
        <li>
          <a class="px-2 py-6.5 inline-block w-full" href="/{$query.space.slug}/posts">포스트 관리</a>
        </li>
        <li>
          <a class="px-2 py-6.5 inline-block w-full" href="/{$query.space.slug}/subscribers">독자 관리</a>
        </li>
        <li>
          <a class="px-2 py-6.5 inline-block w-full" href="/{$query.space.slug}/settings">스페이스 설정</a>
        </li>
      </ul>
    </nav>
  </aside>

  <div class="bg-primary grow-2">
    <slot />
  </div>
</main>

<Footer />
