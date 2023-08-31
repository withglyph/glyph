import path from 'node:path';
import { findWorkspaceDir } from '@pnpm/find-workspace-dir';

export type LambdaSpec = {
  entry: string[];
  public?: string;
};

export const getWorkspaceDir = async () => {
  const workspaceDir = await findWorkspaceDir(process.cwd());

  if (!workspaceDir) {
    throw new Error('Could not locate workspace root');
  }

  return workspaceDir;
};

export const getLambdaSpec = async (projectDir: string) => {
  return (await import(path.resolve(projectDir, 'lambda.config.js')).then(
    (m) => m.default,
  )) as LambdaSpec;
};
