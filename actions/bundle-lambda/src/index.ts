import fs from 'node:fs/promises';
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

type LambdaSpec = { name: string; entrypoint: string };
const spec = JSON.parse(
  await fs.readFile(path.join(projectDir, 'lambda.json'), 'utf8'),
) as { lambda?: LambdaSpec | LambdaSpec[] };

if (!spec.lambda) {
  throw new Error(`Package ${projectName} is not a lambda`);
}

const specs = Array.isArray(spec.lambda) ? spec.lambda : [spec.lambda];

for (const { name, entrypoint } of specs) {
  await bundle({ lambdaName: name, projectDir, entrypointPath: entrypoint });
}
