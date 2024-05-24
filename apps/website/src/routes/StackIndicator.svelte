<script lang="ts">
  import { production, stack } from '@withglyph/lib/environment';
  import IconGitBranch from '~icons/tabler/git-branch';
  import { Icon } from '$lib/components';
  import { isWebView } from '$lib/flutter';
  import { center } from '$styled-system/patterns';
</script>

{#if !production && !$isWebView}
  <div
    class={center({
      position: 'fixed',
      bottom: '0',
      right: '0',
      gap: '8px',
      borderTopLeftRadius: '4px',
      paddingX: '16px',
      paddingY: '8px',
      textAlign: 'center',
      fontFamily: 'mono',
      fontWeight: '[900]',
      letterSpacing: '[0.1em]',
      color: 'red.600',
      backgroundColor: 'red.600/10',
      zIndex: '50',
      pointerEvents: 'none',
      userSelect: 'none',
    })}
  >
    <Icon icon={IconGitBranch} />
    {stack}
  </div>
{/if}
