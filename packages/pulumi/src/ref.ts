import * as pulumi from '@pulumi/pulumi';

const bedrock = new pulumi.StackReference('penxle/bedrock/prod');

export const bedrockRef = (name: string) => {
  return bedrock.requireOutput(name);
};
