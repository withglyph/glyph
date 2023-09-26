<script lang="ts">
  import { graphql } from '$glitch';
  import { ToggleButton } from '$lib/components';
  import type { ContentFilterAction, ContentFilterCategory } from '$glitch/gql';

  export let action: ContentFilterAction;
  export let allButAdult: ContentFilterAction;
  export let category: ContentFilterCategory;

  const updateUserContentFilterPreference = graphql(`
    mutation MeContentFiltersPage_ContentFilterButton_UpdateUserContentFilterPreference_Mutation(
      $input: UpdateUserContentFilterPreferenceInput!
    ) {
      updateUserContentFilterPreference(input: $input) {
        id

        violence: contentFilterPreference(category: VIOLENCE) {
          action
        }

        cruelty: contentFilterPreference(category: CRUELTY) {
          action
        }

        horror: contentFilterPreference(category: HORROR) {
          action
        }

        crime: contentFilterPreference(category: CRIME) {
          action
        }

        trauma: contentFilterPreference(category: TRAUMA) {
          action
        }

        gambling: contentFilterPreference(category: GAMBLING) {
          action
        }

        phobia: contentFilterPreference(category: PHOBIA) {
          action
        }

        insult: contentFilterPreference(category: INSULT) {
          action
        }

        grossness: contentFilterPreference(category: GROSSNESS) {
          action
        }

        other: contentFilterPreference(category: OTHER) {
          action
        }
      }
    }
  `);
</script>

<ToggleButton
  checked={action !== 'HIDE'}
  size="md"
  on:change={async () => {
    await updateUserContentFilterPreference({
      action: action === 'HIDE' ? allButAdult : 'HIDE',
      category,
    });
  }}
>
  <slot />
</ToggleButton>
