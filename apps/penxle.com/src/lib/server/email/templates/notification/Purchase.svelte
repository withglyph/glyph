<script lang="ts">
  export let profileName: string;
  export let postTitle: string;
  export let postURL: string;
</script>

<p>
  {profileName} 님이
  <a href={postURL}>{postTitle}</a>
  포스트를 구매했어요.
</p>
