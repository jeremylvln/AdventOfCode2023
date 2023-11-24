module.exports = {
  extends: [
    '@mansagroup/eslint-config/recommended',
    '@mansagroup/eslint-config/node',
  ],
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: 'tsconfig.json',
      },
    },
  },
  overrides: [
    {
      files: '*.ts',
      rules: {
        '@typescript-eslint/no-non-null-assertion': 'off',
      },
    },
  ],
};
