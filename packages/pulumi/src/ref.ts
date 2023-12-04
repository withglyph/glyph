import * as pulumi from '@pulumi/pulumi';

let ref: pulumi.StackReference;

export const bedrockRef = (name: pulumi.Input<string>) => {
  if (!ref) {
    ref = new pulumi.StackReference('penxle/bedrock/prod');
  }

  return ref.requireOutput(name);
};
