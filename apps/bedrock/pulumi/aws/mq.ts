import * as aws from '@pulumi/aws';
import * as random from '@pulumi/random';
import { securityGroups, subnets } from '$aws/vpc';

const password = new random.RandomPassword('withglyph@mq', {
  length: 20,
  special: false,
});

const broker = new aws.mq.Broker('withglyph', {
  brokerName: 'withglyph',

  engineType: 'RabbitMQ',
  engineVersion: '3.12.13',
  hostInstanceType: 'mq.t3.micro',

  subnetIds: [subnets.private.az1.id],
  securityGroups: [securityGroups.internal.id],

  encryptionOptions: {
    useAwsOwnedKey: false,
  },

  users: [{ username: 'admin', password: password.result }],

  maintenanceWindowStartTime: {
    dayOfWeek: 'MONDAY',
    timeOfDay: '05:00',
    timeZone: 'Asia/Seoul',
  },

  autoMinorVersionUpgrade: true,
  applyImmediately: true,
});

export const mq = {
  broker,
};

export const outputs = {
  AWS_MQ_BROKER_PASSWORD: password.result,
};
