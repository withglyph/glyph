import { logger } from '$lib/server/logging';
import type { Context } from '$lib/server/context';
import type { Plugin } from 'graphql-yoga';

export const useLogging = (): Plugin<Context> => ({
  onExecute: ({ args }) => {
    logger.info(`${args.operationName}`, {
      scope: 'graphql',
      user: args.contextValue.session?.userId,
      ip: args.contextValue.getClientAddress(),
      operation_name: args.operationName,
      variables: args.variableValues,
    });
  },
});
