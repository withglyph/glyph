<script lang="ts">
  import { onMount } from 'svelte';
  import { graphql } from '$glitch';
  import { pageSubTitle } from '$lib/stores';

  $: query = graphql(`
    query MeSettingPostsLayout_Query {
      me @_required {
        id

        posts {
          id
        }
      }
    }
  `);

  onMount(async () => {
    pageSubTitle.set('포스트');
  });
</script>

<section class="flex flex-col gap-4 px-6 py-8 rounded-xl bg-white border border-secondary">
  <h1 class="title-20-eb">
    포스트 <span class="text-secondary m-l-0.25rem">{$query.me.posts.length}</span>
  </h1>
  <slot />
</section>
