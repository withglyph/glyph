import fs from 'node:fs/promises';
import path from 'node:path';
import { findWorkspaceDir } from '@pnpm/find-workspace-dir';
import { nodeFileTrace } from '@vercel/nft';

type BundleParams = { entry: string; index: (entry: string) => string; outDir: string };
export const bundle = async ({ entry, index, outDir }: BundleParams) => {
  const workspaceDir = await findWorkspaceDir(process.cwd());
  if (!workspaceDir) {
    throw new Error('Could not locate workspace root');
  }

  await fs.rm(outDir, { recursive: true, force: true });
  await fs.mkdir(outDir, { recursive: true });

  const trace = await nodeFileTrace([entry], {
    base: workspaceDir,
  });

  const files = [...new Set(trace.fileList)].map((p) => path.join(workspaceDir, p));

  for (const src of files) {
    const stat = await fs.lstat(src);
    const dst = path.join(outDir, path.relative(workspaceDir, src));
    await fs.mkdir(path.dirname(dst), { recursive: true });

    if (stat.isSymbolicLink()) {
      const link = await fs.readlink(src);
      await fs.symlink(link, dst);
    } else if (stat.isFile()) {
      await fs.copyFile(src, dst);
    }
  }

  await fs.writeFile(path.join(outDir, 'index.js'), index(`./${path.relative(workspaceDir, entry)}`));
  await fs.writeFile(path.join(outDir, 'package.json'), JSON.stringify({ type: 'module' }));
};
