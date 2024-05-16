export default {
  '*.(js|ts|svelte)': [
    'eslint --fix',
    'prettier --write --ignore-unknown',
    'cspell --no-progress --relative --no-must-find-files',
  ],
};
