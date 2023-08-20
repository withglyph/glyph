// import { handler } from './.svelte-kit/lambda/function/sites/penxle.com/.svelte-kit/lambda/build/index.js';
import { handler } from './.svelte-kit/lambda/function/index.mjs';

const a = await handler({
  version: '2.0',
  routeKey: '$default',
  rawPath: '/',
  rawQueryString: 'parameter1=value1&parameter1=value2&parameter2=value',
  cookies: ['cookie1', 'cookie2'],
  headers: {
    header1: 'value1',
    header2: 'value1,value2',
  },
  queryStringParameters: {
    parameter1: 'value1,value2',
    parameter2: 'value',
  },
  requestContext: {
    accountId: '123456789012',
    apiId: 'api-id',
    domainName: 'id.execute-api.us-east-1.amazonaws.com',
    domainPrefix: 'id',
    http: {
      method: 'GET',
      path: '/login',
      protocol: 'HTTP/1.1',
      sourceIp: '192.0.2.1',
      userAgent: 'agent',
    },
    requestId: 'id',
    routeKey: '$default',
    stage: '$default',
    time: '12/Mar/2020:19:03:58 +0000',
    timeEpoch: 1_583_348_638_390,
  },
  // body: 'Hello from Lambda',
  pathParameters: {
    parameter1: 'value1',
  },
  isBase64Encoded: false,
  stageVariables: {
    stageVariable1: 'value1',
    stageVariable2: 'value2',
  },
});

console.log(a);

// process.on('exit', (code) => console.log(`Caught!. Exit code: ${code}`));

// process.on('uncaughtException', (err, origin) => {
//   console.error('Unhandled exception. Please handle!', err.stack || err);
//   console.error(`Origin: ${JSON.stringify(origin)}`);
// });

// process.on('unhandledRejection', (err, promise) => {
//   console.error(
//     'Unhandled promise rejection. Please handle!',
//     promise,
//     err.stack || err,
//   );
// });

// process.on('warning', (warning) => {
//   console.warn(warning.name);
//   console.warn(warning.message);
//   console.warn(warning.stack);
// });

// process.on('rejectionHandled', (promise) => {
//   console.log('rejectionHandled event triggered');
// });
