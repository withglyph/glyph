export default {
  '*': [
    'eslint --fix',
    'prettier --write --ignore-unknown',
    'cspell --no-progress --relative',
  ],
};
