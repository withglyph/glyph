export default {
  '*': [
    'cross-env NODE_OPTIONS=--max-old-space-size=10240 eslint --fix',
    'prettier --write --ignore-unknown',
    'cspell --no-progress --relative --no-must-find-files',
  ],
};
