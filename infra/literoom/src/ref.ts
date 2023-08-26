import * as pulumi from '@pulumi/pulumi';

const bedrockRef = new pulumi.StackReference('penxle/bedrock/production');

export const bedrock = (name: string) => {
  return bedrockRef.requireOutput(name);
};
