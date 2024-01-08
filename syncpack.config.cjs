/** @type {import("syncpack").RcFile} */
module.exports = {
  dependencyTypes: ['prod', 'dev'],
  lintFormatting: false,
  semverGroups: [
    {
      packages: ['**'],
      dependencies: ['@sentry/cli'],
      range: '',
    },
    {
      packages: ['**'],
      dependencies: ['**'],
      range: '^',
    },
  ],
};
