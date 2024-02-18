<script lang="ts">
  export let action: string;
  export let code: string;
  export let url: string;
</script>

<p>아래 링크를 눌러 펜슬에 {action}하세요.</p>
<p>
  <a href={url}>{url}</a>
</p>
<p>
  코드: {code}
</p>
