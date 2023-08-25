import actions from '@actions/core';
import { build } from './build';
import { bundle } from './bundle';
import {
  checkChanges,
  getCurrentStack,
  getLambdaSpecs,
  getProjectDir,
} from './utils';

const main = async () => {
  const stackName = getCurrentStack();
  const projectName = actions.getInput('project');

  const actionChanged = await checkChanges('bundle-lambda');
  const changed = await checkChanges(projectName);
  if (!actionChanged && !changed) {
    actions.info('No changes detected, skipping bundling');
    return;
  }

  await build(projectName);

  const projectDir = await getProjectDir(projectName);
  const specs = await getLambdaSpecs(projectDir);

  for (const spec of specs) {
    await bundle({
      stackName,
      lambdaName: spec.name,
      projectDir,
      entrypointPath: spec.entrypoint,
      assetPath: spec.asset,
    });
  }
};

await main();
