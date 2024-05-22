import { firebase } from '$lib/server/external-api';
import { builder } from '../builder';

/**
 * * Inputs
 */

const SendPushNotificationInput = builder.inputType('SendPushNotificationInput', {
  fields: (t) => ({
    userId: t.string(),
    title: t.string(),
    body: t.string(),
  }),
});

/**
 * * Queries
 */

builder.queryFields((t) => ({
  hello: t.string({
    args: { name: t.arg.string() },
    resolve: (_, args) => `Hello, ${args.name}`,
  }),
}));

/**
 * * Mutations
 */

builder.mutationFields((t) => ({
  sendPushNotification: t.boolean({
    authScopes: { admin: true },
    args: { input: t.arg({ type: SendPushNotificationInput }) },
    resolve: async (_, { input }) => {
      return await firebase.sendPushNotification({
        userId: input.userId,
        title: input.title,
        body: input.body,
      });
    },
  }),
}));
