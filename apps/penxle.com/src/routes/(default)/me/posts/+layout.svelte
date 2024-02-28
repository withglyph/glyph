<script lang="ts">
  import { onMount } from 'svelte';
  import { graphql } from '$glitch';
  import { pageSubTitle } from '$lib/stores';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';

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

<section
  class={flex({
    direction: 'column',
    gap: '16px',
    borderWidth: '1px',
    borderColor: 'gray.200',
    borderRadius: '12px',
    paddingX: '24px',
    paddingY: '32px',
    backgroundColor: 'white',
    smDown: {
      marginX: '20px',
      marginY: '16px',
    },
  })}
>
  <h1 class={css({ fontSize: '20px', fontWeight: 'bold' })}>
    포스트 <span class={css({ marginLeft: '4px', color: 'gray.500' })}>{$query.me.posts.length}</span>
  </h1>
  <slot />
</section>
