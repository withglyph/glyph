import * as aws from '@pulumi/aws';

export const usEast1 = new aws.Provider('us-east-1', {
  region: 'us-east-1',
});
