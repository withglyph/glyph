/** @type {import('prettier').Config} */
// eslint-disable-next-line import/no-default-export
export default {
  htmlWhitespaceSensitivity: 'ignore',
  singleQuote: true,
  quoteProps: 'consistent',

  xmlWhitespaceSensitivity: 'ignore',
  xmlQuoteAttributes: 'double',

  plugins: [
    'prettier-plugin-packagejson',
    'prettier-plugin-prisma',
    'prettier-plugin-sh',
    'prettier-plugin-svelte',
    '@prettier/plugin-xml',
  ],
};
