<script lang="ts">
  import { datadogRum } from '@datadog/browser-rum';
  import { production } from '@withglyph/lib/environment';
  import { onMount } from 'svelte';
  import { afterNavigate } from '$app/navigation';
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
      trackViewsManually: true,
      defaultPrivacyLevel: 'allow',
    });
  });

  afterNavigate(({ to }) => {
    datadogRum.startView({
      name: to?.route.id ?? undefined,
    });
  });
</script>
