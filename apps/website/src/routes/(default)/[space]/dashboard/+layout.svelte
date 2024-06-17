<script lang="ts">
  import IconBook2 from '~icons/tabler/book2';
  import IconNotes from '~icons/tabler/notes';
  import IconPlanet from '~icons/tabler/planet';
  import IconScan from '~icons/tabler/scan';
  import IconUserX from '~icons/tabler/user-x';
  import { graphql } from '$glitch';
  import { flex } from '$styled-system/patterns';
  import NavItem from '../../me/NavItem.svelte';

  $: query = graphql(`
    query SpaceDashboardLayout_Query($slug: String!) {
      space(slug: $slug) {
        id
        slug
        name
        visibility

        icon {
          id
          ...Image_image
        }

        meAsMember @_required {
          id

          profile {
            id
            name

            ...Avatar_profile
          }
        }
      }
    }
  `);
</script>

<div
  class={flex({
    direction: { base: 'column', sm: 'row' },
    grow: '1',
    marginX: 'auto',
    width: 'full',
    maxWidth: '1280px',
  })}
>
  <nav
    class={flex({
      direction: { base: 'row', sm: 'column' },
      flex: 'none',
      borderColor: 'gray.150',
      width: { base: 'full', sm: '302px' },
      smDown: {
        gap: '28px',
        position: 'sticky',
        top: '62px',
        borderBottomWidth: '1px',
        paddingX: '20px',
        paddingY: '14px',
        backgroundColor: 'gray.0',
        height: '54px',
        scrollbar: 'hidden',
        overflowX: 'auto',
        zIndex: '50',
      },
      sm: {
        paddingTop: '40px',
        borderRightWidth: '1px',
      },
    })}
  >
    <NavItem icon={IconPlanet} pathname="/{$query.space.slug}/dashboard/settings" title="스페이스" />
    <NavItem icon={IconNotes} pathname="/{$query.space.slug}/dashboard/posts" title="포스트" />
    <NavItem icon={IconBook2} pathname="/{$query.space.slug}/dashboard/collections" title="컬렉션" />
    <NavItem icon={IconScan} pathname="/{$query.space.slug}/dashboard/redeem" title="리딤코드" />
    <NavItem icon={IconUserX} pathname="/{$query.space.slug}/dashboard/subscribers/blocked" title="차단" />
  </nav>

  <main
    class={flex({
      direction: 'column',
      grow: '1',
      marginTop: { base: '20px', sm: '40px' },
      paddingX: { base: '20px', sm: '60px' },
      paddingBottom: { base: '96px', sm: '120px' },
      minWidth: '0',
      width: 'full',
    })}
  >
    <slot />
  </main>
</div>
