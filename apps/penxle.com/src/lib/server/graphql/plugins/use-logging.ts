import { logger } from '$lib/server/logging';
import type { Plugin } from 'graphql-yoga';
import type { Context } from '$lib/server/context';

export const useLogging = (): Plugin<Context> => ({
  onExecute: ({ args }) => {
    logger.debug({
      context: 'graphql',
      operation_name: args.operationName,
      variables: args.variableValues,
    });
  },
});
