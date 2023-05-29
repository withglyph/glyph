<script lang="ts">
  import { load } from '$lib/api';

  const data = load((t) => t.test.db.query());
</script>

<code>{$data}</code>
