<script lang="ts">
  import { emojiData } from '.';

  export let emoji: string;
</script>

{emojiData.emojis[emoji].skins[0].native}
