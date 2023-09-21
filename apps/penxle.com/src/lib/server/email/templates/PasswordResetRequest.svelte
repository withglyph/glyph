<script lang="ts">
  export let name: string;
  export let url: string;
</script>

<p>
  안녕하세요, <span class="name">{name}</span>
  님!
</p>
<p>
  비밀번호를 잊으셨나요? 아래 링크를 클릭하시면 비밀번호를 재설정할 수 있습니다.
  <br />
  <small>이 링크는 1시간 동안 유효해요.</small>
</p>
<p>
  <a href={url}>{url}</a>
</p>

<style>
  .name {
    font-weight: 700;
  }
</style>
