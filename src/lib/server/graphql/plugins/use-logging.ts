import { logger } from '$lib/server/logging';
import type { Context } from '../context';
import type { Plugin } from 'graphql-yoga';

export const useLogging = (): Plugin<Context> => ({
  onExecute: ({ args }) => {
    logger.info(
      `${args.operationName}(${JSON.stringify(args.variableValues)})`,
      {
        scope: 'graphql',
        id: args.contextValue.session?.profileId,
        ip: args.contextValue.getClientAddress(),
        operation_name: args.operationName,
        variables: args.variableValues,
      }
    );
  },
});
