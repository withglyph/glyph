/** @type {import("syncpack").RcFile} */
module.exports = {
  dependencyTypes: ['prod', 'dev'],
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
