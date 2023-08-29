import * as cloudflare from '@pulumi/cloudflare';
import { zones } from '$cloudflare/zone';

new cloudflare.PageRule('penxle.com,redirect=www', {
  zoneId: zones.penxle_com.id,
  target: 'www.penxle.com/*',
  actions: {
    forwardingUrl: {
      url: 'https://penxle.com/$1',
      statusCode: 301,
    },
  },
});

new cloudflare.PageRule('penxle.io,redirect=www', {
  zoneId: zones.penxle_io.id,
  target: 'www.penxle.io/*',
  actions: {
    forwardingUrl: {
      url: 'https://penxle.io/$1',
      statusCode: 301,
    },
  },
});

new cloudflare.PageRule('pnxl.cc,redirect=penxle.com', {
  zoneId: zones.pnxl_cc.id,
  target: 'pnxl.cc',
  priority: 2,
  actions: {
    forwardingUrl: {
      url: 'https://penxle.com',
      statusCode: 302,
    },
  },
});

new cloudflare.PageRule('pnxl.cc,redirect=penxle.com/s', {
  zoneId: zones.pnxl_cc.id,
  target: 'pnxl.cc/*',
  priority: 1,
  actions: {
    forwardingUrl: {
      url: 'https://penxle.com/s/$1',
      statusCode: 302,
    },
  },
});

// new cloudflare.Ruleset(
//   'penxle.com,dynamic=redirect',
//   {
//     zoneId: zones.penxle_com.id,
//     kind: 'zone',
//     name: 'penxle.com',
//     phase: 'http_request_dynamic_redirect',

//     rules: [
//       {
//         description: 'Redirect www to apex',
//         action: 'redirect',
//         expression: '(http.host eq "www.penxle.com")',
//         actionParameters: {
//           fromValue: {
//             statusCode: 308,
//             preserveQueryString: true,
//             targetUrl: {
//               expression: 'concat("https://penxle.com", http.request.uri.path)',
//             },
//           },
//         },
//       },
//     ],
//   },
//   { deleteBeforeReplace: true },
// );

// new cloudflare.Ruleset(
//   'penxle.io,dynamic=redirect',
//   {
//     zoneId: zones.penxle_io.id,
//     kind: 'zone',
//     name: 'penxle.io',
//     phase: 'http_request_dynamic_redirect',

//     rules: [
//       {
//         description: 'Redirect www to apex',
//         action: 'redirect',
//         expression: '(http.host eq "www.penxle.io")',

//         actionParameters: {
//           fromValue: {
//             statusCode: 308,
//             preserveQueryString: true,

//             targetUrl: {
//               expression: 'concat("https://penxle.io", http.request.uri.path)',
//             },
//           },
//         },
//       },
//     ],
//   },
//   { deleteBeforeReplace: true },
// );

// new cloudflare.Ruleset(
//   'pnxl.cc,dynamic=redirect',
//   {
//     zoneId: zones.pnxl_cc.id,
//     kind: 'zone',
//     name: 'pnxl.cc',
//     phase: 'http_request_dynamic_redirect',

//     rules: [
//       {
//         description: 'Redirect root to penxle.com',
//         action: 'redirect',
//         expression: '(http.host eq "pnxl.cc" and http.request.uri.path eq "/")',

//         actionParameters: {
//           fromValue: {
//             statusCode: 303,

//             targetUrl: {
//               value: 'https://penxle.com',
//             },
//           },
//         },
//       },
//       {
//         description: 'Redirect shorturls to penxle.com',
//         action: 'redirect',
//         expression: '(http.host eq "pnxl.cc")',

//         actionParameters: {
//           fromValue: {
//             statusCode: 303,

//             targetUrl: {
//               expression:
//                 'concat("https://penxle.com/s", http.request.uri.path)',
//             },
//           },
//         },
//       },
//     ],
//   },
//   { deleteBeforeReplace: true },
// );

export const outputs = {};
