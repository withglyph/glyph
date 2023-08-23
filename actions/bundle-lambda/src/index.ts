import path from 'node:path';
import actions from '@actions/core';
import { pnpmWorkspaceInfo } from '@node-kit/pnpm-workspace-info';
import { bundle } from './bundle';

const workspaceInfo = await pnpmWorkspaceInfo();
if (!workspaceInfo) {
  throw new Error('Could not retrieve workspace info');
}

const projectName = actions.getInput('project');
if (!(projectName in workspaceInfo)) {
  throw new Error(`Could not locate project ${projectName}`);
}

const pkg = workspaceInfo[projectName];
const projectDir = pkg.path;

type LambdaSpec = { name: string; entrypoint: string; asset?: string };
type LambdaConfig = { default: LambdaSpec | LambdaSpec[] };
const config = (await import(
  path.resolve(projectDir, 'lambda.config.js')
)) as LambdaConfig;

const specs = Array.isArray(config.default) ? config.default : [config.default];

for (const spec of specs) {
  await bundle({
    lambdaName: spec.name,
    projectDir,
    entrypointPath: spec.entrypoint,
    assetPath: spec.asset,
  });
}
