<script lang="ts">
  export let profileName: string;
  export let postTitle: string;
  export let postURL: string;
</script>

<p>
  <span class="name">{profileName}</span>
  님이
  <a class="name" href={postURL}>{postTitle}</a>
  포스트를 구매했어요.
</p>

<style>
  .name {
    font-weight: 700;
  }
</style>
