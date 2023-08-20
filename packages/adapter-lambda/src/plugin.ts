import type { Builder } from '@sveltejs/kit';
import type { Plugin } from 'esbuild';

export function ignoreMissingModules(builder: Builder): Plugin {
  return {
    name: 'ignore-missing-modules',

    setup: (build) => {
      build.onResolve({ filter: /.*/ }, async (args) => {
        if (args.path.endsWith('.node')) {
          console.log(args.path);
        }

        if (args.path.includes('argon2')) {
          console.log(args.path);
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (args.pluginData?.checked) {
          return;
        }

        const result = await build.resolve(args.path, {
          importer: args.importer,
          namespace: args.namespace,
          kind: args.kind,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          pluginData: { ...args.pluginData, checked: true },
          resolveDir: args.resolveDir,
        });

        if (result.errors.length === 0) {
          return result;
        }

        builder.log.info(`Failed to resolve module: ${args.path} -- ignoring`);

        return {
          path: args.path,
          namespace: 'missing',
          external: true,
        };
      });
    },
  };
}
