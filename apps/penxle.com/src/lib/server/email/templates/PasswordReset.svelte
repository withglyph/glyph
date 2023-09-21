<script lang="ts">
  export let name: string;
</script>

<p>
  안녕하세요, <span class="name">{name}</span>
  님!
</p>
<p>
  <span class="name">{name}</span>
  님의 비밀번호가 변경되었어요.
</p>
<p>
  혹시 직접 비밀번호를 변경하신 게 아니라면, <a href="https://help.penxle.com/">
    도움 센터
  </a>
  로 문의해주세요.
</p>

<style>
  .name {
    font-weight: 700;
  }
</style>
