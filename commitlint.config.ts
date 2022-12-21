/* eslint-disable import/no-import-module-exports */
import type { UserConfig } from '@commitlint/types';

const Configuration: UserConfig = {
  extends: ['@commitlint/config-conventional'],
};

exports.module = Configuration;
