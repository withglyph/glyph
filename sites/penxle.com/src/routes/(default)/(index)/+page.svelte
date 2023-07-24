<script lang="ts">
  import { Helmet } from '$lib/components';
  import { ImageCropper } from '$lib/components/editor';
</script>

<Helmet
  description="펜슬은 개인 창작자들을 위한 자유롭고 즐거운 창작 공간이에요."
  image={{ src: 'https://pnxl.net/assets/og.png', size: 'large' }}
  title="펜슬 - 창작을 즐겁게"
/>

<code>Hello world!</code>

<ImageCropper />
