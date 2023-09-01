/** @type {import('houdini').ConfigFile} */
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
    BigInt: { type: 'bigint' },
    DateTime: { type: 'Date' },
    JSON: { type: 'unknown' },
  },
};
