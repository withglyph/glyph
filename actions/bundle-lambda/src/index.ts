import actions from '@actions/core';
import { build } from './build';
import { bundle } from './bundle';
import { checkChanges, getLambdaSpecs, getProjectDir } from './utils';

const main = async () => {
  const projectName = actions.getInput('project');

  const changed = await checkChanges(projectName);
  if (!changed) {
    actions.info('No changes detected, skipping bundling');
    return;
  }

  await build(projectName);

  const projectDir = await getProjectDir(projectName);
  const specs = await getLambdaSpecs(projectDir);

  for (const spec of specs) {
    await bundle({
      lambdaName: spec.name,
      projectDir,
      entrypointPath: spec.entrypoint,
      assetPath: spec.asset,
    });
  }
};

await main();
