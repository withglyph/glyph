<script lang="ts">
  export let profileName: string;
  export let spaceName: string;
  export let spaceURL: string;
</script>

<p>
  <span class="name">{profileName}</span>
  님이
  <a class="name" href={spaceURL}>{spaceName}</a>
  스페이스를 관심 추가했어요.
</p>

<style>
  .name {
    font-weight: 700;
  }
</style>
