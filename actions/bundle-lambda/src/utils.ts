import path from 'node:path';
import { pnpmWorkspaceInfo } from '@node-kit/pnpm-workspace-info';
import { $ } from 'execa';

type LambdaSpec = { name: string; entrypoint: string; asset?: string };
type LambdaConfig = { default: LambdaSpec | LambdaSpec[] };

export const getProjectDir = async (project: string) => {
  const workspaceInfo = await pnpmWorkspaceInfo();
  if (!workspaceInfo) {
    throw new Error('Could not retrieve workspace info');
  }

  if (!(project in workspaceInfo)) {
    throw new Error(`Could not locate project ${project}`);
  }

  return workspaceInfo[project].path;
};

export const getLambdaSpecs = async (projectDir: string) => {
  const { default: config } = (await import(
    path.resolve(projectDir, 'lambda.config.js')
  )) as LambdaConfig;

  return Array.isArray(config) ? config : [config];
};

export const checkChanges = async (project: string) => {
  const { stdout } =
    await $`pnpm exec turbo run build --filter=${project}...[HEAD^] --dry=json`;

  const { packages } = JSON.parse(stdout) as { packages: string[] };
  return packages.length === 0 ? false : true;
};
