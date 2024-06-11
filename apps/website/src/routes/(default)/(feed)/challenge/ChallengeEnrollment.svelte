<script lang="ts">
  import IconCheck from '~icons/tabler/check';
  import CompactLogo from '$assets/logos/compact.svg?component';
  import { fragment, graphql } from '$glitch';
  import { Icon } from '$lib/components';
  import { css } from '$styled-system/css';
  import { center } from '$styled-system/patterns';
  import type { ChallengeEnrollment_userEventEnrollment } from '$glitch';

  let _eventEnrollment: ChallengeEnrollment_userEventEnrollment | null = null;
  export { _eventEnrollment as $eventEnrollment };

  export let weekOfMonth: string;
  export let dateRange: string;

  $: eventEnrollment = fragment(
    _eventEnrollment,
    graphql(`
      fragment ChallengeEnrollment_userEventEnrollment on UserEventEnrollment {
        id
        eligible
      }
    `),
  );
</script>

<li>
  {#if $eventEnrollment?.eligible}
    <div
      class={center({
        position: 'relative',
        borderWidth: '2px',
        borderColor: 'brand.400',
        borderRadius: 'full',
        backgroundColor: '[#F2EEFF]',
        size: '60px',
      })}
    >
      <CompactLogo class={css({ color: 'brand.400', width: '1/4' })} />
      <div
        class={css({
          position: 'absolute',
          bottom: '0',
          right: '0',
          borderRadius: 'full',
          padding: '4px',
          backgroundColor: 'brand.400',
        })}
      >
        <Icon style={css.raw({ color: 'gray.0' })} icon={IconCheck} size={12} />
      </div>
    </div>
  {:else}
    <div
      class={center({
        borderWidth: '1px',
        borderColor: '[#d1d1d1]',
        borderStyle: 'dashed',
        borderRadius: 'full',
        backgroundColor: 'gray.100',
        size: '60px',
      })}
    >
      <CompactLogo class={css({ color: 'gray.300', width: '1/4' })} />
    </div>
  {/if}
  <dl class={css({ marginTop: '8px', textAlign: 'center' })}>
    <dt class={css({ fontSize: '12px', fontWeight: 'semibold', color: 'gray.600' })}>{weekOfMonth}</dt>
    <dd class={css({ fontSize: '11px', color: '[#818181]' })}>{dateRange}</dd>
  </dl>
</li>
