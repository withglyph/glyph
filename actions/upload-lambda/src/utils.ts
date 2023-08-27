import path from 'node:path';
import github from '@actions/github';
import { findWorkspaceDir } from '@pnpm/find-workspace-dir';
import { findWorkspacePackagesNoCheck } from '@pnpm/workspace.find-packages';

type LambdaSpec = {
  name: string;
  base: string;
  entrypoint: string;
  assets?: string;
};
type LambdaConfig = { default: LambdaSpec | LambdaSpec[] };

export const getWorkspaceDir = async () => {
  const workspaceDir = await findWorkspaceDir(process.cwd());

  if (!workspaceDir) {
    throw new Error('Could not locate workspace root');
  }

  return workspaceDir;
};

export const getProjectDir = async (project: string) => {
  const projects = await findWorkspacePackagesNoCheck('.');

  for (const { dir, manifest } of projects) {
    if (manifest.name === `@penxle/${project}`) {
      return dir;
    }
  }

  throw new Error(`Could not locate project ${project}`);
};

export const getLambdaSpecs = async (projectDir: string) => {
  const { default: config } = (await import(
    path.resolve(projectDir, 'lambda.config.js')
  )) as LambdaConfig;

  return Array.isArray(config) ? config : [config];
};

export const getCurrentStack = () => {
  if (
    github.context.eventName === 'pull_request' &&
    github.context.payload.pull_request
  ) {
    return `pr-${github.context.payload.pull_request.number}`;
  }

  if (
    github.context.eventName === 'push' &&
    github.context.ref === 'refs/heads/main'
  ) {
    return 'production';
  }

  throw new Error('Could not determine stack name');
};
