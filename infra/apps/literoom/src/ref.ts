import * as pulumi from '@pulumi/pulumi';

const baselineRef = new pulumi.StackReference('penxle/baseline/main');

export const baseline = (name: string) => {
  return baselineRef.requireOutput(name);
};
