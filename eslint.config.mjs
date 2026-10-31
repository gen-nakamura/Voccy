import vue from 'eslint-plugin-vue';
export default [
  { ignores: ['node_modules/**', 'dist/**', 'release*/**', 'evidence/**', '.builder-cache/**', '.electron-cache/**', '.temp/**'] },
  ...vue.configs['flat/essential'],
  { files: ['**/*.js', '**/*.mjs', '**/*.cjs', '**/*.vue'], rules: { 'no-unused-vars': 'error', 'no-undef': 'error' }, languageOptions: { globals: { require: 'readonly', module: 'readonly', __dirname: 'readonly', process: 'readonly', console: 'readonly', setTimeout: 'readonly', clearTimeout: 'readonly', window: 'readonly', document: 'readonly' } } },
  { files: ['**/*.cjs'], languageOptions: { sourceType: 'commonjs' } }
];
