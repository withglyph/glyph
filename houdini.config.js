/** @type {import('houdini').ConfigFile} */
// eslint-disable-next-line import/no-default-export
export default {
  acceptImperativeInstability: true,
  defaultCachePolicy: 'CacheAndNetwork',
  plugins: {
    'houdini-svelte': {
      client: './src/lib/houdini/client',
      defaultRouteBlocking: true,
    },
  },
  scalars: {
    DateTime: { type: 'Date' },
    JSON: { type: 'unknown' },
  },
};
