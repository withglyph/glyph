<script lang="ts">
  import { Radio } from '$lib/components/forms';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';

  export let adultFilter: boolean | null;
  export let updateSearchFilter: ((page: number) => void) | undefined = undefined;
</script>

<div>
  <p class={css({ marginBottom: '12px', fontWeight: 'semibold' })}>성인물 표시</p>

  <fieldset class={flex({ direction: 'column', gap: '8px' })}>
    <Radio
      checked={adultFilter === null}
      on:change={() => {
        adultFilter = null;
        if (updateSearchFilter) updateSearchFilter(1);
      }}
    >
      성인물 포함
    </Radio>
    <Radio
      checked={adultFilter === false}
      on:change={() => {
        adultFilter = false;
        if (updateSearchFilter) updateSearchFilter(1);
      }}
    >
      성인물 제외
    </Radio>
    <Radio
      checked={adultFilter === true}
      on:change={() => {
        adultFilter = true;
        if (updateSearchFilter) updateSearchFilter(1);
      }}
    >
      성인물만
    </Radio>
  </fieldset>
</div>
