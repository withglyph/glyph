<script lang="ts">
  import { graphql } from '$houdini';
  import { Helmet } from '$lib/components';

  const subscription = graphql(/* GraphQL */ `
    subscription SubscriptionPage_Subscription {
      countdown
    }
  `);

  void subscription.listen(null);
</script>

<Helmet title="Subscription" />

<code>{$subscription.data?.countdown}</code>
