import { logger } from '$lib/server/logging';
import type { Plugin } from 'graphql-yoga';
import type { Context } from '$lib/server/context';

export const useLogging = (): Plugin<Context> => ({
  onExecute: ({ args }) => {
    logger.info(`${args.operationName}`, {
      scope: 'graphql',
      user: args.contextValue.session?.userId,
      ip: args.contextValue.getClientAddress(),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      operation_name: args.operationName,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      variables: args.variableValues,
    });
  },
});
