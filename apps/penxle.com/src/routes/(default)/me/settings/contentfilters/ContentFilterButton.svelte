<script lang="ts">
  import * as R from 'radash';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { ToggleButton } from '$lib/components';
  import type { ContentFilterCategory, MeSettingsContentFiltersPage_ContentFilterButton_user } from '$glitch';

  let _user: MeSettingsContentFiltersPage_ContentFilterButton_user;
  export { _user as $user };
  export let category: ContentFilterCategory;

  $: user = fragment(
    _user,
    graphql(`
      fragment MeSettingsContentFiltersPage_ContentFilterButton_user on User {
        contentFilterPreferences {
          id
          category
          action
        }
      }
    `),
  );

  const updateUserContentFilterPreference = graphql(`
    mutation MeSettingsContentFiltersPage_ContentFilterButton_UpdateUserContentFilterPreference_Mutation(
      $input: UpdateUserContentFilterPreferenceInput!
    ) {
      updateUserContentFilterPreference(input: $input) {
        id

        contentFilterPreferences {
          id
          category
          action
        }
      }
    }
  `);

  $: preferences = R.objectify(
    $user.contentFilterPreferences,
    (v) => v.category,
    (v) => v.action,
  );
</script>

<ToggleButton
  checked={preferences[category] === 'EXPOSE'}
  size="md"
  on:change={async (e) => {
    const action = e.currentTarget.checked ? 'EXPOSE' : 'WARN';

    await updateUserContentFilterPreference({ category, action });
    mixpanel.track('user:content-filter-preference:update', { category, action });
  }}
>
  <slot />
</ToggleButton>
