import * as pulumi from '@pulumi/pulumi';

let ref: pulumi.StackReference;

export const bedrockRef = (name: string) => {
  if (!ref) {
    ref = new pulumi.StackReference('penxle/bedrock/prod');
  }

  return ref.requireOutput(name);
};
