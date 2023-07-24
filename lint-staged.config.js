export default {
  '*': 'prettier --check --ignore-unknown',
  '*.{ts,js,svelte}': 'eslint',
};
