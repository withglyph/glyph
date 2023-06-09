<script lang="ts">
  import { random } from 'radash';
  import { Button, Helmet } from '$lib/components';
  import { toast } from '$lib/notification';
  import { createId } from '$lib/utils';

  toast.error('Error');
  toast.success('Success');
  toast.info('Info');
</script>

<Helmet title="Toast" />

<div class="flex gap-4">
  <Button
    on:click={() =>
      toast.info(createId(random(10, 100)), {
        title: createId(random(10, 20)),
      })}
  >
    Info
  </Button>

  <Button
    on:click={() =>
      toast.success(createId(random(10, 100)), {
        title: createId(random(10, 20)),
      })}
  >
    Success
  </Button>

  <Button
    on:click={() =>
      toast.error(createId(random(10, 100)), {
        title: createId(random(10, 20)),
      })}
  >
    Error
  </Button>
</div>
