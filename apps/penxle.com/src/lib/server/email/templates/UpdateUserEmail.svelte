<script lang="ts">
  export let name: string;
  export let url: string;
  export let email: string;
</script>

<p>
  안녕하세요, <span class="name">{name}</span>
  님!
</p>
<p>
  PENXLE 계정에 등록된 이메일 주소를 {email}로 변경하려고 해요. 변경하시려는 게 맞다면 아래 링크를 눌러주세요.
</p>
<p>
  <a href={url}>{url}</a>
</p>

<style>
  .name {
    font-weight: 700;
  }
</style>
