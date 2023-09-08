<script lang="ts">
  import { beforeNavigate } from '$app/navigation';
  import { updated } from '$app/stores';

  beforeNavigate(({ willUnload, to }) => {
    if ($updated && !willUnload && to?.url) {
      location.href = to.url.href;
    }
  });
</script>
