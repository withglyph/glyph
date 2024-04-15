<script lang="ts">
  export let profileName: string;
  export let spaceName: string;
  export let spaceURL: string;
</script>

<p>
  {profileName} 님이
  <a href={spaceURL}>{spaceName}</a>
  스페이스를 관심 추가했어요.
</p>
