<script lang="ts">
  import { datadogRum } from '@datadog/browser-rum';
  import { production } from '@withglyph/lib/environment';
  import { onMount } from 'svelte';
  import { env } from '$env/dynamic/public';

  onMount(() => {
    if (!production) {
      return;
    }

    datadogRum.init({
      applicationId: env.PUBLIC_DATADOG_APP_ID,
      clientToken: env.PUBLIC_DATADOG_CLIENT_TOKEN,
      site: 'ap1.datadoghq.com',
      service: 'glyph',
      env: 'prod',
      sessionSampleRate: 100,
      sessionReplaySampleRate: 20,
      trackUserInteractions: true,
      trackResources: true,
      trackLongTasks: true,
      defaultPrivacyLevel: 'allow',
    });
  });
</script>
