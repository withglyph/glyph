// import * as aws from '@pulumi/aws';
// import * as random from '@pulumi/random';
// import { securityGroups, subnets } from '$aws/vpc';

// const password = new random.RandomPassword('penxle@mq', {
//   length: 20,
//   special: false,
// });

// const mq = new aws.mq.Broker('penxle', {
//   brokerName: 'penxle',

//   engineType: 'RabbitMQ',
//   engineVersion: '3.11.16',
//   hostInstanceType: 'mq.t3.micro',

//   subnetIds: [subnets.private.az1.id],
//   securityGroups: [securityGroups.internal.id],

//   users: [{ username: 'admin', password: password.result }],

//   maintenanceWindowStartTime: {
//     dayOfWeek: 'MONDAY',
//     timeOfDay: '05:00',
//     timeZone: 'Asia/Seoul',
//   },

//   applyImmediately: true,
// });

// export { mq };

// export const outputs = {
//   AWS_MQ_BROKER_PASSWORD: password.result,
// };

export {};
