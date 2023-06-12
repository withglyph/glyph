/** @type {import('houdini').ConfigFile} */
// eslint-disable-next-line import/no-default-export
export default {
  acceptImperativeInstability: true,
  defaultCachePolicy: 'NetworkOnly',
  plugins: {
    'houdini-svelte': {
      client: './src/lib/houdini/client',
      defaultRouteBlocking: true,
    },
  },
  scalars: {
    JSON: { type: 'unknown' },
    Void: { type: 'never' },
  },
  watchSchema: { url: 'http://127.0.0.1:4000/api/graphql' },
};
