<script lang="ts">
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Avatar, Button, Image } from '$lib/components';
  import { isWebView, postFlutterMessage } from '$lib/flutter';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import type { Space_space } from '$glitch';

  let _space: Space_space;
  export { _space as $space };

  $: space = fragment(
    _space,
    graphql(`
      fragment Space_space on Space {
        id
        name
        slug
        description

        icon {
          id
          ...Image_image
        }

        members {
          id

          profile {
            id
            name
            ...Avatar_profile
          }
        }
      }
    `),
  );

  const unfollowSpace = graphql(`
    mutation MeSubscribesSpace_UnfollowSpace_Mutation($input: UnfollowSpaceInput!) {
      unfollowSpace(input: $input) {
        id
      }
    }
  `);
</script>

<div
  class={flex({
    direction: 'column',
    borderColor: 'gray.150',
    paddingBottom: { base: '20px', sm: '16px' },
    sm: { borderWidth: '1px' },
    smDown: { borderBottomWidth: '1px' },
  })}
>
  <svelte:element
    this={$isWebView ? 'button' : 'a'}
    class={flex({ gap: '12px', paddingX: { sm: '16px' }, paddingTop: { base: '20px', sm: '16px' }, textAlign: 'left' })}
    href={$isWebView ? undefined : `/${$space.slug}`}
    role={$isWebView ? 'button' : undefined}
    on:click={() => {
      if ($isWebView) {
        postFlutterMessage({ type: 'space:view', slug: $space.slug });
      }
    }}
  >
    <div class={css({ position: 'relative', flex: 'none', height: 'fit' })}>
      <Image
        style={css.raw({ borderWidth: '[0.8px]', borderColor: 'gray.100', size: '36px' })}
        $image={$space.icon}
        placeholder
        size={48}
      />
      <Avatar
        style={css.raw({
          position: 'absolute',
          bottom: '-4px',
          right: '-4px',
          borderWidth: '[0.8px]',
          borderColor: 'gray.100',
          borderRadius: 'full',
          size: '24px',
        })}
        $profile={$space.members[0].profile}
        size={24}
      />
    </div>

    <div class={css({ truncate: true })}>
      <p class={css({ fontSize: '15px', fontWeight: 'semibold', truncate: true })}>{$space.name}</p>
      <p class={css({ fontSize: '14px', fontWeight: 'medium', color: 'gray.600', truncate: true })}>
        by {$space.members[0].profile.name}
      </p>

      <p class={css({ marginTop: '8px', fontSize: '12px', color: 'gray.500', height: '17px', truncate: true })}>
        {$space.description ?? ''}
      </p>
    </div>
  </svelte:element>

  <Button
    style={css.raw({ marginTop: '8px', marginLeft: 'auto', marginRight: { sm: '16px' }, width: '68px' })}
    size="sm"
    variant="gray-sub-fill"
    on:click={async () => {
      await unfollowSpace({ spaceId: $space.id });
      mixpanel.track('space:unfollow', { spaceId: $space.id });
    }}
  >
    구독중
  </Button>
</div>
