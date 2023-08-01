export default {
  htmlWhitespaceSensitivity: 'ignore',
  singleQuote: true,
  quoteProps: 'consistent',

  xmlWhitespaceSensitivity: 'ignore',
  xmlQuoteAttributes: 'double',

  plugins: [
    'prettier-plugin-prisma',
    'prettier-plugin-sh',
    'prettier-plugin-svelte',
    '@prettier/plugin-xml',
  ],
};
