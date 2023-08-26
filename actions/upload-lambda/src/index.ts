import actions from '@actions/core';
import { build } from './build';
import { getCurrentStack, getLambdaSpecs, getProjectDir } from './utils';

const main = async () => {
  const stackName = getCurrentStack();
  const projectName = actions.getInput('project');

  const projectDir = await getProjectDir(projectName);
  const specs = await getLambdaSpecs(projectDir);

  for (const spec of specs) {
    await build({
      stackName,
      lambdaName: spec.name,
      projectDir,
      entrypointPath: spec.entrypoint,
      assetsPath: spec.assets,
    });
  }
};

await main();
