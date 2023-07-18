import { logger } from '$lib/server/logging';
import type { Context } from '../context';
import type { Plugin } from 'graphql-yoga';

export const useLogging = (): Plugin<Context> => ({
  onExecute: ({ args }) => {
    logger.info({
      context: 'graphql',
      id: args.contextValue.session?.profileId,
      ip: args.contextValue.getClientAddress(),
      operation_name: args.operationName,
      variables: args.variableValues,
    });
  },
});
