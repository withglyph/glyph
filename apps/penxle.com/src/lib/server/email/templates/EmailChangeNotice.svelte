<script lang="ts">
  export let name: string;
  export let email: string;
</script>

<p>
  안녕하세요, <span class="name">{name}</span>
  님!
</p>
<p>
  PENXLE 계정 이메일 주소가 {email}으로 변경되었어요.
</p>
<p>
  혹시 직접 이메일을 변경하신 게 아니라면, <a href="https://help.penxle.com/">
    도움 센터
  </a>
  로 문의해주세요.
</p>

<style>
  .name {
    font-weight: 700;
  }
</style>
