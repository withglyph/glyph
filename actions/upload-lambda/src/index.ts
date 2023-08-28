import actions from '@actions/core';
import { build } from './build';
import { getLambdaSpecs, getProjectDir } from './utils';

const main = async () => {
  const stackName = actions.getInput('stack');
  const projectName = actions.getInput('project');

  const projectPath = await getProjectDir(projectName);
  const specs = await getLambdaSpecs(projectPath);

  for (const spec of specs) {
    await build({
      stackName,
      lambdaName: spec.name,
      basePath: spec.base,
      projectPath,
      entrypointPath: spec.entrypoint,
      assetsPath: spec.assets,
    });
  }
};

await main();
