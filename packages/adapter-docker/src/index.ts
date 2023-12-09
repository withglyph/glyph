import fs from 'node:fs/promises';
import path from 'node:path';
import { findWorkspaceDir } from '@pnpm/find-workspace-dir';
import { nodeFileTrace } from '@vercel/nft';
import type { Adapter } from '@sveltejs/kit';

export const docker = (): Adapter => {
  return {
    name: '@penxle/adapter-docker',
    adapt: async (builder) => {
      const tmp = builder.getBuildDirectory('adapter-docker');
      const out = 'dist';

      const workspaceDir = await findWorkspaceDir(process.cwd());
      if (!workspaceDir) {
        throw new Error('Could not locate workspace root');
      }

      const prerendered: Record<string, string> = {};
      for (const [p, { file }] of builder.prerendered.pages.entries()) {
        prerendered[p] = file;
      }

      builder.rimraf(tmp);
      builder.rimraf(out);

      builder.mkdirp(tmp);
      builder.mkdirp(out);

      builder.writeServer(tmp);

      await fs.appendFile(path.join(tmp, 'manifest.js'), `export const prerendered = ${JSON.stringify(prerendered)};`);

      await fs.writeFile(
        path.join(tmp, 'server.js'),
        `
          import '@penxle/tracing';
          import { serve as serveInternal } from '@penxle/adapter-docker/server';
          import { Server } from './index.js';
          import { manifest, prerendered } from './manifest.js';
          export const serve = (basePath) => serveInternal({ basePath, Server, manifest, prerendered });
        `,
      );

      const trace = await nodeFileTrace([path.join(tmp, 'server.js')], {
        base: workspaceDir,
      });

      const files = [...new Set(trace.fileList)].map((p) => path.join(workspaceDir, p));

      for (const src of files) {
        const stat = await fs.lstat(src);
        const dst = path.join(out, path.relative(workspaceDir, src));
        await fs.mkdir(path.dirname(dst), { recursive: true });

        if (stat.isSymbolicLink()) {
          const link = await fs.readlink(src);
          await fs.symlink(link, dst);
        } else if (stat.isFile()) {
          await fs.copyFile(src, dst);
        }
      }

      const code = `
        import path from 'node:path';
        import { fileURLToPath } from 'node:url';
        import { serve } from './${path.relative(workspaceDir, path.join(tmp, 'server.js'))}';
        await serve(path.dirname(fileURLToPath(import.meta.url)));
      `.trim();
      await fs.writeFile(path.join(out, 'index.js'), code);
      await fs.writeFile(path.join(out, 'package.json'), JSON.stringify({ type: 'module' }));

      builder.writeClient(path.join(out, 'public'));
      builder.writePrerendered(path.join(out, 'public'));
    },
  };
};
