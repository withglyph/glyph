<script lang="ts">
  export let name: string;
  export let url: string;
</script>

<p>
  안녕하세요, <span class="name">{name}</span>
  님!
</p>
<p>
  PENXLE에 가입하신 걸 환영합니다! 이메일 주소를 인증하시려면 아래 링크를
  클릭해주세요.
</p>
<p>
  <a href={url}>{url}</a>
</p>

<style>
  .name {
    font-weight: 700;
  }
</style>
