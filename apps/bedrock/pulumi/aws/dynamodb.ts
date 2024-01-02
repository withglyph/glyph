import * as aws from '@pulumi/aws';

new aws.dynamodb.Table('cashflow', {
  name: 'cashflow',

  billingMode: 'PAY_PER_REQUEST',

  hashKey: 'id',
  rangeKey: 'dt',
  attributes: [
    { name: 'id', type: 'S' },
    { name: 'dt', type: 'S' },
  ],
});
