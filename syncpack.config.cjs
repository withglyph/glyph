/** @type {import("syncpack").RcFile} */
module.exports = {
  dependencyTypes: ['prod', 'dev'],
  lintFormatting: false,
  semverGroups: [
    {
      packages: ['**'],
      dependencies: ['prosemirror-view'],
      range: '',
    },
    {
      packages: ['**'],
      dependencies: ['**'],
      range: '^',
    },
  ],
};
