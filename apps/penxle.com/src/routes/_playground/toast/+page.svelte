<script lang="ts">
  import { Button } from '$lib/components';
  import { toast } from '$lib/notification';
</script>

<div class="flex grow center gap-4">
  <Button color="primary" on:click={() => toast.success('성공했어요')}>
    toast.success
  </Button>
  <Button color="primary" on:click={() => toast.error('실패 !!')}>
    toast.error
  </Button>
</div>
