import { writeArtifactAssets, writeMiscAssets, writePublicAssets } from './codegen/writer';
import { buildContext } from './context';

const main = async () => {
  const context = await buildContext();
  await writeArtifactAssets(context.bifrostDir, context.schema, context.operationMap, context.fragmentMap);
  await writePublicAssets(context.bifrostDir, context.artifacts);
  await writeMiscAssets(context.bifrostDir);
};

// eslint-disable-next-line import/no-default-export
export default main;
